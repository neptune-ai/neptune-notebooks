import React from 'react';

import { backendClient } from 'common/api/backend-client';
import { ProjectWithRoleDTO } from 'generated/backend-client/src/models';
import { bemBlock} from "common/utils/bem";

import ValidationWrapper from "common/components/validation-wrapper/ValidationWrapper";
import ValidationIcon from "common/components/validation-icon/ValidationIcon";

interface ProjectInputProps {
  className?: string,
  value: string
  disabled?: boolean
  onChange: (projectId: string) => void
}

const block = bemBlock('project-input');

const ProjectInput: React.FC<ProjectInputProps> = ({
  className,
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
    <ValidationWrapper>
      <select
        className={block({extra: className})}
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
      <ValidationIcon status={loading ? 'pending' : undefined} />
    </ValidationWrapper>
  );
};

export default ProjectInput;

