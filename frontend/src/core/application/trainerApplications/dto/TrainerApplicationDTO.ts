export interface TrainerApplicationDTO {
  id: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  createdAt: string;
}


