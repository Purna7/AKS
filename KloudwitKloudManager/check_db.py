import sqlite3

conn = sqlite3.connect(r'C:\Users\kloud\AKSLearning\AKS\KloudwitKloudManager\instance\kloudmanager.db')
cursor = conn.cursor()

# Check cloud_resources
cursor.execute('SELECT COUNT(*) FROM cloud_resources')
count = cursor.fetchone()[0]
print(f'Total resources: {count}')

if count > 0:
    cursor.execute('SELECT name, resource_type, region, status FROM cloud_resources')
    print('\nResources:')
    for row in cursor.fetchall():
        print(f'  - {row[0]} ({row[1]}) in {row[2]} - Status: {row[3]}')

# Check cloud_providers
cursor.execute('SELECT name, is_enabled, sync_status FROM cloud_providers')
print('\nProviders:')
for row in cursor.fetchall():
    print(f'  - {row[0]}: Enabled={row[1]}, Sync Status={row[2]}')

conn.close()
