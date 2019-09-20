import React from 'react';

import { backendClient } from 'common/api/backend-client';
import { ProjectWithRoleDTO } from 'generated/backend-client/src/models';

interface ProjectInputProps {
  value: string
  disabled?: boolean
  onChange: (projectId: string) => void
}

const ProjectInput: React.FC<ProjectInputProps> = ({
  value,
  disabled,
  onChange: onChangeProp,
}) => {

  const [ loading, setLoading ] = React.useState(false);

  const [ projectList, setProjectList ] = React.useState<Array<ProjectWithRoleDTO>>(() => {
    setLoading(true);

    backendClient.api.listProjectsForMemberOrHigher({})
      .then(({ entries }) => {

        setProjectList(entries);

        /* TODO: implement setting initial state
        if (!value && entries.length > 0) {
          onChangeProp(entries[0].id);
        }
        */

        setLoading(false);
      });

    return [];
  });

  return (
    <React.Fragment>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChangeProp(event.target.value)}
      >
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

