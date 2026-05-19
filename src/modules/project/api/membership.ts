import { apiFetch } from '../../../api/http';
import { mapMember } from '../../../api/mappers';
import {
    JoinProjectRequest,
    MemberResponseDto,
    UpdateMemberStatusRequest,
} from '../../../types/dto';
import { Member, MemberStatus } from '../../../types/domain';

export async function joinProject(projectId: string, roleIds: number[]): Promise<Member> {
    const request: JoinProjectRequest = { roleIds };
    const dto = await apiFetch<MemberResponseDto>(`/projects/${projectId}/members`, {
        method: 'POST',
        body: JSON.stringify(request),
    });
    return mapMember(dto);
}

export async function removeProjectMember(projectId: string, memberId: string): Promise<void> {
    await apiFetch<void>(`/projects/${projectId}/members/${memberId}`, {
        method: 'DELETE',
    });
}

export async function updateMemberStatus(
    projectId: string,
    memberId: string,
    status: MemberStatus,
): Promise<Member> {
    const request: UpdateMemberStatusRequest = { status };
    const dto = await apiFetch<MemberResponseDto>(`/projects/${projectId}/members/${memberId}`, {
        method: 'PATCH',
        body: JSON.stringify(request),
    });
    return mapMember(dto);
}
