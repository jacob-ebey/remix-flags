import { useOutletContext } from "@remix-run/react";

import type { LoaderData as OutletContext } from "./docs._layout";

export default function DocsHome() {
  let { html } = useOutletContext() as OutletContext;

  return <main dangerouslySetInnerHTML={{ __html: html }} />;
}
