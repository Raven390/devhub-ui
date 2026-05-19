import React, { useCallback, useMemo, useState } from 'react';
import styles from './JoinProjectButton.module.css';
import { joinProject } from '../api/membership';
import { RoleSelectModal } from './RoleSelectModal';
import { RoleDto } from '../../../types/dto';
import { Member, MemberStatus, Status } from '../../../types/domain';

interface JoinProjectButtonProps {
    projectId: string;
    roles: RoleDto[];
    currentUserId: string;
    projectStatus: Status;
    members: Member[];
    onJoined: (member: Member) => void;
}

const activeMemberStatuses = new Set<MemberStatus>(['OWNER', 'ACTIVE', 'INVITED']);

export const JoinProjectButton: React.FC<JoinProjectButtonProps> = ({
    projectId,
    roles,
    currentUserId,
    projectStatus,
    members,
    onJoined,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const currentMember = useMemo(
        () => members.find(member => member.user.id === currentUserId),
        [currentUserId, members],
    );

    const isCurrentUserMember = currentMember
        ? activeMemberStatuses.has(currentMember.status)
        : false;

    const handleConfirm = useCallback(async (roleIds: number[]) => {
        const member = await joinProject(projectId, roleIds);
        onJoined(member);
    }, [onJoined, projectId]);

    if (!currentUserId || projectStatus !== 'RECRUITING' || isCurrentUserMember) {
        return null;
    }

    return (
        <div className={styles.wrap}>
            <button
                className={styles.button}
                type="button"
                onClick={() => setIsModalOpen(true)}
            >
                Вступить в проект
            </button>
            {roles.length === 0 && (
                <span className={styles.hint}>Роли не указаны</span>
            )}
            {isModalOpen && (
                <RoleSelectModal
                    roles={roles}
                    onConfirm={handleConfirm}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};
