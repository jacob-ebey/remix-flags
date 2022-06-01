import { deferred } from "remix";
import { Link, useLoaderData } from "@remix-run/react";

import type { LoaderFunction } from "~/types";
import { InlineDeferred, requireUserId } from "~/utils";

type LoaderData = {
  projects: { id: string; name: string }[];
  [key: string]: unknown;
};

export let loader: LoaderFunction = async ({ context: { db, session } }) => {
  let userId = requireUserId(session, "/dashboard");

  let projects = await db.getProjectsByUserId(userId);

  let projectFlags = projects.slice(0, 5).reduce(
    (acc, project) => ({
      ...acc,
      [project.id]: db
        .getFlagsByProjectId({ projectId: project.id, userId })
        .then((flags) => flags.map((flag) => ({ enabled: flag.enabled }))),
    }),
    {} as Record<string, Promise<{ enabled: boolean }[]>>
  );

  return deferred<LoaderData>({ ...projectFlags, projects });
};

export default function ProjectsDashboard() {
  let { projects, ...deferredLoaderData } = useLoaderData() as LoaderData;

  return (
    <main id="projects">
      <h1>Projects</h1>
      <p>
        <Link className="paper-btn" to="projects/new#new-project">
          New Project
        </Link>
      </p>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>ID</th>
              <th>Enabled Flags</th>
              <th>Total Flags</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(({ id, name }) => (
              <tr key={id}>
                <td>
                  <Link to={`project/${id}`}>{name}</Link>
                </td>
                <td>
                  <Link to={`project/${id}`}>{id}</Link>
                </td>
                <InlineDeferred<{ enabled: boolean }[]>
                  data={deferredLoaderData[id]}
                  error={
                    <>
                      <td>...</td>
                      <td>...</td>
                    </>
                  }
                  fallback={
                    <>
                      <td>...</td>
                      <td>...</td>
                    </>
                  }
                >
                  {({ value: flags }) =>
                    flags ? (
                      <>
                        <td>
                          {flags.reduce(
                            (enabled: number, flag: { enabled: boolean }) => {
                              if (flag.enabled) enabled++;
                              return enabled;
                            },
                            0
                          )}
                        </td>
                        <td>{flags.length || 0}</td>
                      </>
                    ) : (
                      <>
                        <td>...</td>
                        <td>...</td>
                      </>
                    )
                  }
                </InlineDeferred>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
