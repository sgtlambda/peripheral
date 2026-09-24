import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT     = dirname(fileURLToPath(import.meta.url));
const CSV_PATH = resolve(ROOT, 'data/flamePresets.csv');
const ENDPOINT = '/api/flame-presets';

/**
 * Dev-server backing store for the flame playground's preset database.
 *
 * `GET /api/flame-presets` returns the raw CSV text (empty if the file doesn't
 * exist yet), `PUT` overwrites it. The whole table is written at once — the
 * playground holds the full list in memory and a single browser tab is the only
 * writer, so there is nothing to merge.
 *
 * Ladle loads this config too, so the endpoint exists in `vite dev` and
 * `ladle serve` alike.
 */
function flamePresetsPlugin() {
    return {
        name: 'flame-presets',
        apply: 'serve',
        configureServer(server) {
            server.middlewares.use(ENDPOINT, async (req, res) => {
                try {
                    if (req.method === 'GET') {
                        const csv = await readFile(CSV_PATH, 'utf8').catch(() => '');
                        // Explicit: something upstream already set 404 on the response.
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                        res.setHeader('Cache-Control', 'no-store');
                        res.end(csv);
                        return;
                    }
                    if (req.method === 'PUT') {
                        const chunks = [];
                        for await (const chunk of req) chunks.push(chunk);
                        await mkdir(dirname(CSV_PATH), {recursive: true});
                        await writeFile(CSV_PATH, Buffer.concat(chunks).toString('utf8'), 'utf8');
                        res.statusCode = 204;
                        res.end();
                        return;
                    }
                    res.statusCode = 405;
                    res.end('method not allowed');
                } catch (error) {
                    res.statusCode = 500;
                    res.end(String(error));
                }
            });
        },
    };
}

export default {
    plugins: [flamePresetsPlugin()],
};
