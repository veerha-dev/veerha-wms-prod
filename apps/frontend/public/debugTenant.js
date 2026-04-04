// Copy and paste this into the browser console at http://localhost:8081
// This will help debug the tenant creation issue

(async function debugTenantCreation() {
  console.log('🔍 Debugging tenant creation...');
  
  try {
    // Step 1: Check if user is authenticated
    const { data: { user }, error: authError } = await window.supabase.auth.getUser();
    console.log('User:', user);
    console.log('Auth error:', authError);
    
    if (!user) {
      console.error('❌ No user authenticated');
      return;
    }

    // Step 2: Try to get existing profiles
    console.log('\n🔍 Checking existing profiles...');
    try {
      const { data: profiles, error: profileError } = await window.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id);
      console.log('Profiles:', profiles);
      console.log('Profile error:', profileError);
    } catch (error) {
      console.log('Profile query error:', error);
    }

    // Step 3: Try to get existing tenants
    console.log('\n🔍 Checking existing tenants...');
    try {
      const { data: tenants, error: tenantError } = await window.supabase
        .from('tenants')
        .select('*');
      console.log('All tenants:', tenants);
      console.log('Tenant error:', tenantError);
    } catch (error) {
      console.log('Tenant query error:', error);
    }

    // Step 4: Try to create a tenant
    console.log('\n🔍 Attempting to create tenant...');
    try {
      const { data: newTenant, error: createError } = await window.supabase
        .from('tenants')
        .insert({
          name: 'Debug Organization',
          plan: 'starter',
          enabled_modules: ['warehouse-setup', 'inventory-sku'],
          max_warehouses: 5,
          max_skus: 1000,
          max_users: 10,
          max_daily_movements: 1000,
        })
        .select();
      console.log('Created tenant:', newTenant);
      console.log('Create error:', createError);
    } catch (error) {
      console.log('Tenant create error:', error);
      console.log('Error details:', error.details);
    }

    // Step 5: Try to create a profile
    console.log('\n🔍 Attempting to create profile...');
    try {
      const { data: newProfile, error: profileCreateError } = await window.supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          tenant_id: 'test-tenant-id', // Using test ID for debugging
          email: user.email,
          full_name: user.user_metadata?.full_name || 'Debug User',
          is_active: true,
        });
      console.log('Created profile:', newProfile);
      console.log('Profile create error:', profileCreateError);
    } catch (error) {
      console.log('Profile create error:', error);
      console.log('Error details:', error.details);
    }

    // Step 6: Check RLS policies
    console.log('\n🔍 Checking RLS policies...');
    try {
      const { data: rlsPolicies } = await window.supabase
        .from('pg_policies')
        .select('*')
        .eq('table', 'tenants');
      console.log('RLS policies for tenants:', rlsPolicies);
    } catch (error) {
      console.log('RLS policies error:', error);
    }

    try {
      const { data: rlsPolicies2 } = await window.supabase
        .from('pg_policies')
        .select('*')
        .eq('table', 'profiles');
      console.log('RLS policies for profiles:', rlsPolicies2);
    } catch (error) {
      console.log('RLS policies error:', error);
    }

  } catch (error) {
    console.error('Debug error:', error);
  }
}

console.log('🚀 Debug function loaded! Run debugTenantCreation() to start debugging');
window.debugTenantCreation = debugTenantCreation;
