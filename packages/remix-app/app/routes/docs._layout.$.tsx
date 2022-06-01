import type { MetaFunction } from "remix";
import { json } from "remix";
import { useLoaderData } from "@remix-run/react";

import type { LoaderFunction } from "~/types";

export let meta: MetaFunction = (args) => {
  let { title, description } = (args.data as LoaderData) || {};

  return { title, description };
};

type LoaderData = {
  title: string;
  description: string;
  html: string;
};

export let loader: LoaderFunction = async ({ params }) => {
  let docResponse = await fetch(
    `https://github-md.com/jacob-ebey/remix-flags/main/docs/${params["*"]}.md`
  );
  let doc = (await docResponse.json()) as {
    attributes: {
      title: string;
      description: string;
    };
    html: string;
  };

  return json<LoaderData>({
    title: doc.attributes.title,
    description: doc.attributes.description,
    html: doc.html,
  });
};

export default function DocsCatchAll() {
  let { html } = useLoaderData() as LoaderData;

  return <main dangerouslySetInnerHTML={{ __html: html }} />;
}
