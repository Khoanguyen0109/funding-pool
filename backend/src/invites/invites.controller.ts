import {
  Controller, Get, Post, Delete, Patch, Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { User } from '../users/entities/user.entity';

@Controller()
@UseGuards(JwtAuthGuard)
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  // --- Invite management (owner) ---

  @Post('pools/:poolId/invites')
  create(
    @Param('poolId') poolId: string,
    @Body() dto: CreateInviteDto,
    @Req() req: any,
  ) {
    const user = req.user as User;
    return this.invitesService.createInvite(poolId, user.id, dto);
  }

  @Get('pools/:poolId/invites')
  findAll(@Param('poolId') poolId: string, @Req() req: any) {
    const user = req.user as User;
    return this.invitesService.getInvites(poolId, user.id);
  }

  @Delete('pools/:poolId/invites/:inviteId')
  revoke(
    @Param('poolId') poolId: string,
    @Param('inviteId') inviteId: string,
    @Req() req: any,
  ) {
    const user = req.user as User;
    return this.invitesService.revokeInvite(poolId, inviteId, user.id);
  }

  // --- Invite redemption ---

  @Get('invites/:token')
  preview(@Param('token') token: string, @Req() req: any) {
    const user = req.user as User;
    return this.invitesService.getInvitePreview(token, user.id);
  }

  @Post('invites/:token/redeem')
  redeem(@Param('token') token: string, @Req() req: any) {
    const user = req.user as User;
    return this.invitesService.redeemInvite(token, user.id);
  }

  // --- Pending members (owner) ---

  @Get('pools/:poolId/members/pending')
  pendingMembers(@Param('poolId') poolId: string, @Req() req: any) {
    const user = req.user as User;
    return this.invitesService.getPendingMembers(poolId, user.id);
  }

  @Patch('pools/:poolId/members/:userId/approve')
  approveMember(
    @Param('poolId') poolId: string,
    @Param('userId') targetUserId: string,
    @Req() req: any,
  ) {
    const user = req.user as User;
    return this.invitesService.approveMember(poolId, targetUserId, user.id);
  }

  @Patch('pools/:poolId/members/:userId/reject')
  rejectMember(
    @Param('poolId') poolId: string,
    @Param('userId') targetUserId: string,
    @Req() req: any,
  ) {
    const user = req.user as User;
    return this.invitesService.rejectMember(poolId, targetUserId, user.id);
  }

  // --- User search ---

  @Get('users/search')
  searchUsers(@Query('q') query: string, @Req() req: any) {
    const user = req.user as User;
    return this.invitesService.searchUsers(query || '', user.id);
  }

  // --- My pending invitations ---

  @Get('users/me/invitations')
  myInvitations(@Req() req: any) {
    const user = req.user as User;
    return this.invitesService.getMyInvitations(user.id);
  }
}
