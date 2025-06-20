import { App, SSLApp } from "uWebSockets.js";
import { version } from "../../package.json";
import { util } from "../../shared/utils/util";
import { ApiServer } from "./apiServer";
import { Config } from "./config";
import { GIT_VERSION } from "./utils/gitRevision";
import { Logger } from "./utils/logger";
import { readPostedJSON, returnJson } from "./utils/serverHelpers";
import { type FindGameBody } from "../../shared/types/api";

util.mergeDeep(Config, {
    regions: {
        local: {
            https: false,
            address: `${(Config as any).devServer.host}:${(Config as any).devServer.port}`,
            l10n: "index-local",
        },
    },
});

const logger = new Logger("Dev server");
const apiServer = new ApiServer();

const app = (Config as any).devServer.ssl
    ? SSLApp({
          key_file_name: (Config as any).devServer.ssl.keyFile,
          cert_file_name: (Config as any).devServer.ssl.certFile,
      })
    : App();

app.post("/api/find_game", async (res) => {
    readPostedJSON(
        res,
        async (body: FindGameBody) => {
            const data = await apiServer.findGame(body);
            res.cork(() => {
                returnJson(res, data);
            });
        },
        () => {
            logger.warn("/api/find_game: Error retrieving body");
        },
    );
});

setInterval(() => {
    apiServer.updateRegion("local", {
        playerCount: 1,
    });
}, 10 * 1000);

apiServer.init(app);

app.listen((Config as any).devServer.host, (Config as any).devServer.port, (): void => {
    logger.info(`Survev Dev Server v${version} - GIT ${GIT_VERSION}`);
    logger.info(`Listening on ${(Config as any).devServer.host}:${(Config as any).devServer.port}`);
    logger.info("Press Ctrl+C to exit.");
});
