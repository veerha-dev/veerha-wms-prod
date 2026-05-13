import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { getCurrentTenantId } from '../common/tenant.context';
import { BulkLayoutDto, BulkLayoutResult } from './dto/bulk-layout.dto';

/**
 * Creates a complete warehouse layout (zones → aisles → racks → bins) in
 * one atomic transaction. Used by the admin onboarding wizard step 2.
 *
 * Codes are auto-generated; levels and positions are exploded out into
 * individual bin rows so stock can be tracked at the bin level immediately.
 */
@Injectable()
export class WarehousesLayoutService {
  constructor(private readonly db: DatabaseService) {}

  async createLayout(warehouseId: string, dto: BulkLayoutDto): Promise<BulkLayoutResult> {
    const tid = getCurrentTenantId();

    const whCheck = await this.db.query(
      `SELECT id, name FROM warehouses WHERE id = $1 AND tenant_id = $2`,
      [warehouseId, tid],
    );
    if (whCheck.rowCount === 0) {
      throw new NotFoundException(`Warehouse ${warehouseId} not found`);
    }

    const result: BulkLayoutResult = {
      warehouseId,
      created: { zones: 0, aisles: 0, racks: 0, bins: 0 },
    };

    await this.db.transaction(async (client) => {
      // Pre-compute next code numbers per type so codes stay sequential.
      const nextZoneIdx = await nextSeq(client, tid, 'zones', 'ZN');
      const nextAisleIdx = await nextSeq(client, tid, 'aisles', 'AL');
      const nextRackIdx = await nextSeq(client, tid, 'racks', 'RK');
      const nextBinIdx = await nextSeq(client, tid, 'bins', 'BIN');

      let zSeq = nextZoneIdx;
      let aSeq = nextAisleIdx;
      let rSeq = nextRackIdx;
      let bSeq = nextBinIdx;

      for (const zoneSpec of dto.zones) {
        const zoneCode = `ZN-${pad(zSeq++)}`;
        const zoneRes = await client.query(
          `INSERT INTO zones (tenant_id, warehouse_id, code, name, type, is_active)
           VALUES ($1, $2, $3, $4, $5, true)
           RETURNING id`,
          [tid, warehouseId, zoneCode, zoneSpec.name, zoneSpec.type],
        );
        const zoneId = zoneRes.rows[0].id;
        result.created.zones++;

        const aisleCount = zoneSpec.aisleCount ?? 0;
        const aisleIds: string[] = [];

        if (aisleCount > 0) {
          for (let i = 0; i < aisleCount; i++) {
            const aisleCode = `AL-${pad(aSeq++)}`;
            const aisleRes = await client.query(
              `INSERT INTO aisles (tenant_id, zone_id, code, name, sort_order)
               VALUES ($1, $2, $3, $4, $5)
               RETURNING id`,
              [tid, zoneId, aisleCode, `${zoneSpec.name} Aisle ${i + 1}`, i + 1],
            );
            aisleIds.push(aisleRes.rows[0].id);
            result.created.aisles++;
          }
        }

        // Distribute racks across aisles (or all under zone if no aisles).
        const totalRacks = zoneSpec.rackCount;
        const buckets: Array<string | null> =
          aisleIds.length > 0
            ? Array.from({ length: totalRacks }, (_, idx) => aisleIds[idx % aisleIds.length])
            : Array.from({ length: totalRacks }, () => null);

        for (let r = 0; r < totalRacks; r++) {
          const rackCode = `RK-${pad(rSeq++)}`;
          const aisleId = buckets[r];
          const rackRes = await client.query(
            `INSERT INTO racks (tenant_id, zone_id, aisle_id, code, name, levels, slots_per_level)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [
              tid,
              zoneId,
              aisleId,
              rackCode,
              `${zoneSpec.name} Rack ${r + 1}`,
              zoneSpec.levels,
              zoneSpec.positionsPerLevel,
            ],
          );
          const rackId = rackRes.rows[0].id;
          result.created.racks++;

          // Bins: levels × positions
          for (let lvl = 1; lvl <= zoneSpec.levels; lvl++) {
            for (let pos = 1; pos <= zoneSpec.positionsPerLevel; pos++) {
              const binCode = `BIN-${pad(bSeq++)}`;
              await client.query(
                `INSERT INTO bins (tenant_id, warehouse_id, zone_id, rack_id, code, level, position, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'empty')`,
                [tid, warehouseId, zoneId, rackId, binCode, lvl, pos],
              );
              result.created.bins++;
            }
          }
        }

        // Update zone rollup counts
        await client.query(
          `UPDATE zones
             SET rack_count = $1, bin_count = $2, updated_at = NOW()
           WHERE id = $3`,
          [totalRacks, totalRacks * zoneSpec.levels * zoneSpec.positionsPerLevel, zoneId],
        );
      }

      // Update warehouse capacity rollup
      await client.query(
        `UPDATE warehouses SET total_capacity = (
            SELECT COUNT(*) FROM bins WHERE warehouse_id = $1
          ), updated_at = NOW()
          WHERE id = $1`,
        [warehouseId],
      );
    });

    return result;
  }
}

function pad(n: number): string {
  return String(n).padStart(3, '0');
}

async function nextSeq(client: any, tid: string, table: string, prefix: string): Promise<number> {
  const res = await client.query(
    `SELECT COUNT(*)::int AS c FROM ${table} WHERE tenant_id = $1`,
    [tid],
  );
  return (res.rows[0]?.c ?? 0) + 1;
}
