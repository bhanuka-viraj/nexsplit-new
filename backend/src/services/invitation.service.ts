import mongoose from 'mongoose';
import { Invitation } from '../models/invitation.model';
import { Group } from '../models/group.model';
import { User } from '../models/user.model';
import { AppError } from '../utils/AppError';
import { StatusCodes } from 'http-status-codes';

export const createInvitation = async (fromUserId: string, groupId: string, toUserId: string) => {
  // Check if group exists
  const group = await Group.findById(groupId);
  if (!group) {
    throw new AppError('Group not found', StatusCodes.NOT_FOUND);
  }

  // Check if sender is member
  const isSenderMember = group.members.some((m: any) => m.toString() === fromUserId);
  if (!isSenderMember) {
    throw new AppError('You are not a member of this group', StatusCodes.FORBIDDEN);
  }

  // Check if target user really exists
  const toUser = await User.findById(toUserId);
  if (!toUser) {
    throw new AppError('User to invite not found', StatusCodes.NOT_FOUND);
  }

  // Check if already a member
  const isAlreadyMember = group.members.some((m: any) => m.toString() === toUserId);
  if (isAlreadyMember) {
    throw new AppError('User is already a member', StatusCodes.CONFLICT);
  }

  // Check if pending invite exists
  const existingInvite = await Invitation.findOne({ groupId, toUserId, status: 'PENDING' });
  if (existingInvite) {
     throw new AppError('Invitation already sent', StatusCodes.CONFLICT);
  }

  const invitation = await Invitation.create({
    groupId,
    fromUserId,
    toUserId,
  });

  return invitation;
};

export const getMyPendingInvitations = async (userId: string) => {
  return await Invitation.find({ toUserId: userId, status: 'PENDING' })
    .populate('groupId', 'name imageUrl')
    .populate('fromUserId', 'name avatarUrl');
};

export const respondToInvitation = async (userId: string, invitationId: string, accept: boolean) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
      const invitation = await Invitation.findOne({ _id: invitationId, toUserId: userId }).session(session);
      
      if (!invitation) {
        throw new AppError('Invitation not found or not for you', StatusCodes.NOT_FOUND);
      }

      if (invitation.status !== 'PENDING') {
          throw new AppError('Invitation already responded to', StatusCodes.BAD_REQUEST);
      }

      if (accept) {
          invitation.status = 'ACCEPTED';
          await invitation.save({ session });

          // Add user to Group
          await Group.findByIdAndUpdate(
              invitation.groupId,
              { $addToSet: { members: userId } },
              { session }
          );
      } else {
          invitation.status = 'DECLINED';
          await invitation.save({ session });
      }

      await session.commitTransaction();
      return invitation;
  } catch (error) {
      await session.abortTransaction();
      throw error;
  } finally {
      session.endSession();
  }
};
