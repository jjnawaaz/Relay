import "dotenv/config";
import httpServer from "./index.js";

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`WS Server started on port ${PORT}`);
});
