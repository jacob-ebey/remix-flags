import type { MetaFunction } from "remix";
import { json } from "remix";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";

export let meta: MetaFunction = (args) => {
  let { title, description } = (args.data as LoaderData) || {};

  return { title, description };
};

export type LoaderData = {
  title: string;
  description: string;
  html: string;
  navigation: { label: string; to: string }[];
};

export let loader = async () => {
  let docResponse = await fetch(
    "https://github-md.com/jacob-ebey/remix-flags/main/docs/index.md"
  );
  let doc = (await docResponse.json()) as {
    attributes: {
      title: string;
      description: string;
      navigation: { label: string; to: string }[];
    };
    html: string;
  };

  return json<LoaderData>({
    title: doc.attributes.title,
    description: doc.attributes.description,
    html: doc.html,
    navigation: doc.attributes.navigation,
  });
};

export default function DocsLayout() {
  let data = useLoaderData() as LoaderData;

  return (
    <div className="row">
      <div className="sm-12 md-8 col">
        <div className="paper">
          <Outlet context={data} />
        </div>
      </div>
      <div className="sm-12 md-4 col sidebar">
        <aside className="paper">
          <h3 className="text-center">Documentation</h3>
          <div className="row flex-center">
            {data.navigation.map(({ label, to }) => (
              <NavLink className="sm-12 paper-btn" to={to} end={to === "/docs"}>
                {label}
              </NavLink>
            ))}
          </div>
        </aside>
        <footer className="paper">
          <div className="row flex-center">
            <p>
              Made with 💛 by{" "}
              <a
                href="https://github.com/jacob-ebey"
                target="_blank"
                rel="noreferrer"
              >
                Jacob
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
