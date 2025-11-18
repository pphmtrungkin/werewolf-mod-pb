import PocketBase from "pocketbase";
import { useMemo } from "react";

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

pb.autoCancellation(false);

export default pb;

