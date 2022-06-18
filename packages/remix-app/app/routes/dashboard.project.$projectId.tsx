import { json } from "remix";
import {
  Link,
  NavLink,
  Outlet,
  useLoaderData,
  useMatches,
} from "@remix-run/react";

import type { LoaderFunction } from "~/types";
import { requireUserId } from "~/utils";

type LoaderData = {
  project: { id: string; name: string };
};

export type OutletContext = LoaderData["project"];

export let loader: LoaderFunction = async ({
  context: { db, session },
  params: { projectId },
}) => {
  if (!projectId) throw json(null, { status: 404, statusText: "Not Found" });

  let userId = requireUserId(session, `/dashboard/project/${projectId}`);

  let project = await db.getProjectById({ userId, projectId });

  if (!project) throw json(null, { status: 404, statusText: "Not Found" });

  return json<LoaderData>({ project });
};

export default function ProjectDashboard() {
  let { project } = useLoaderData() as LoaderData;
  let matches = useMatches();

  let breadcrumbs: { text: string; to?: string }[] = [];
  for (let match of matches) {
    if (match.handle?.breadcrumb) {
      breadcrumbs.push(match.handle.breadcrumb);
    }
  }

  return (
    <>
      <ul
        className="breadcrumb"
        style={{ marginBottom: 0, marginTop: 0, paddingBottom: 0 }}
      >
        <li>
          <Link to="/dashboard">Projects</Link>
        </li>
        <li>{project.name}</li>
        {breadcrumbs.map((breadcrumb) => (
          <li key={`${breadcrumb.text}|${breadcrumb.to}`}>
            {breadcrumb.to ? (
              <Link to={breadcrumb.to}>{breadcrumb.text}</Link>
            ) : (
              breadcrumb.text
            )}
          </li>
        ))}
      </ul>
      <div className="row">
        <div className="sm-12 md-4 col sidebar">
          <aside className="paper">
            <dl>
              <dt>Name</dt>
              <dd>{project.name}</dd>
              <dt>ID</dt>
              <dd>{project.id}</dd>
            </dl>

            <div className="row flex-center">
              <NavLink
                className="sm-12 paper-btn"
                to={{ pathname: ".", hash: "#flags" }}
                end
              >
                Flags
              </NavLink>
              <NavLink className="sm-12 paper-btn" to="tokens#tokens">
                API Tokens
              </NavLink>
              <NavLink
                className="sm-12 paper-btn btn-danger"
                to="delete#delete-project"
              >
                Delete Project
              </NavLink>
            </div>
          </aside>
        </div>
        <div className="sm-12 md-8 col">
          <div className="paper">
            <Outlet context={project} />
          </div>
        </div>
      </div>
    </>
  );
}
