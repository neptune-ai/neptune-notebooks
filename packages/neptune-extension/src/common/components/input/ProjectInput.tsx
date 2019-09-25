import React, {ChangeEvent} from 'react';

import { backendClient } from 'common/api/backend-client';
import { ProjectWithRoleDTO } from 'generated/backend-client/src/models';
import { bemBlock} from "common/utils/bem";

import ValidationWrapper from "common/components/validation-wrapper/ValidationWrapper";
import ValidationIcon from "common/components/validation-icon/ValidationIcon";
import Select from 'common/components/input/Select';

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

        if (!value && entries.length > 0) {
          onChangeProp(entries[0].id);
        }

        setLoading(false);
      });

    return [];
  });

  return (
    <ValidationWrapper>
      <Select
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
        </Select>
        <ValidationIcon status={loading ? 'pending' : undefined} />
  </ValidationWrapper>
);
};

export default ProjectInput;
