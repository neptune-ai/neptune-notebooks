import React from 'react';

import {
  getAccessToken,
  listProjects,
} from 'common/api/backend';

const ProjectInput = ({
  token,
  value,
  onChange,
}) => {

  const [ loading, setLoading ] = React.useState(false);
  const [ projectList, setProjectList ] = React.useState([]);

  React.useEffect(() => {
    setLoading(true);

    getAccessToken(token)
      .then(() => {
        listProjects()
          .then(({ data }) => {
            setProjectList(data.entries);

            if (!value && data.entries.length > 0) {
              onChange(data.entries[0].id);
            }

            setLoading(false);
          });
      });
  }, [token]);

  return (
    <React.Fragment>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        { projectList.map((project) => (
          <option
            key={project.id}
            value={project.id}
            children={`${project.organizationName}/${project.name}`}
          />
        ))}
      </select>
      { loading && (
        <span className="fa fa-spin fa-spinner" />
      )}
    </React.Fragment>
  );
};

export default ProjectInput;

