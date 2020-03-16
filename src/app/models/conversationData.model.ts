export interface ConversationData {
  chatID?: string;
  creator_id: string;
  receiver_id: string;
  created_at: Date;
  content: [];
  creatorDeleted?: boolean;
  receiverDeleted?: boolean;
}
