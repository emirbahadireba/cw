-- Seed Plan Limits Data
INSERT INTO plan_limits (plan_name, max_displays, max_users, max_media_storage_gb, max_media_file_size_mb, max_playlists, max_layouts, max_schedules, features, price_monthly, price_yearly)
VALUES 
(
    'free',
    1,
    1,
    1,
    10,
    5,
    5,
    3,
    '{
        "analytics": false,
        "api_access": false,
        "custom_domain": false,
        "priority_support": false,
        "white_label": false
    }'::jsonb,
    0.00,
    0.00
),
(
    'basic',
    5,
    3,
    10,
    50,
    20,
    20,
    10,
    '{
        "analytics": true,
        "api_access": false,
        "custom_domain": false,
        "priority_support": false,
        "white_label": false
    }'::jsonb,
    29.99,
    299.99
),
(
    'premium',
    25,
    10,
    100,
    200,
    NULL,
    NULL,
    NULL,
    '{
        "analytics": true,
        "api_access": true,
        "custom_domain": true,
        "priority_support": true,
        "white_label": false
    }'::jsonb,
    99.99,
    999.99
),
(
    'kurumsal',
    NULL,
    NULL,
    NULL,
    500,
    NULL,
    NULL,
    NULL,
    '{
        "analytics": true,
        "api_access": true,
        "custom_domain": true,
        "priority_support": true,
        "white_label": true,
        "dedicated_support": true,
        "custom_integrations": true
    }'::jsonb,
    NULL,
    NULL
)
ON CONFLICT (plan_name) DO UPDATE SET
    max_displays = EXCLUDED.max_displays,
    max_users = EXCLUDED.max_users,
    max_media_storage_gb = EXCLUDED.max_media_storage_gb,
    max_media_file_size_mb = EXCLUDED.max_media_file_size_mb,
    max_playlists = EXCLUDED.max_playlists,
    max_layouts = EXCLUDED.max_layouts,
    max_schedules = EXCLUDED.max_schedules,
    features = EXCLUDED.features,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    updated_at = CURRENT_TIMESTAMP;

