import { NavLink, Outlet } from "@remix-run/react";

export default function Projects() {
  return (
    <div className="row">
      <div className="sm-12 md-4 col sidebar">
        <aside className="paper">
          <h3 className="text-center">Dashboard</h3>
          <div className="row flex-center">
            <NavLink
              className="sm-12 paper-btn"
              to={{ pathname: ".", hash: "#projects" }}
              end
            >
              Projects
            </NavLink>
            <NavLink className="sm-12 paper-btn" to="profile#profile">
              Profile
            </NavLink>
          </div>
        </aside>
      </div>
      <div className="sm-12 md-8 col">
        <div className="paper">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
