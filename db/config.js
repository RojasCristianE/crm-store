import { config } from 'dotenv';
import { createClient } from '@libsql/client';

config({ path: '.env' });

const turso = createClient({
    url: 'libsql://crm-rojascristianr.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MjI5NTYyMzEsImlkIjoiYTE4ZTI1NGQtMzUwOS00Nzk5LTg2MDAtOTNiNGVlODcwNWM3In0.EzGNuK3aNnuJl7sPazZinShd8C2yyvbzgLq9bKkLIbkggHNL_Y5gymZTFsxf0N2JuQR6To7X9InGvkVBoEQuAg',
});

export default turso;