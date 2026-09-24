import { contactRepository } from './contact.repository';
import { NotFoundError } from '../../types/errors';
import { CreateContactInput, ListContactMessagesQuery } from './contact.validator';
import { ContactStatus } from '@prisma/client';

export class ContactService {
  async submitContact(input: CreateContactInput) {
    return contactRepository.create({
      ...input,
      status: ContactStatus.NEW
    });
  }

  async getAllMessages(query: ListContactMessagesQuery) {
    const data = await contactRepository.findAll(query);
    const total = await contactRepository.count({ status: query.status, search: query.search });
    return { data, total };
  }
  
  async getMessageById(id: string) {
    const message = await contactRepository.findById(id);
    if (!message) throw new NotFoundError('Contact message not found');
    return message;
  }

  async updateMessageStatus(id: string, status: ContactStatus) {
    const message = await contactRepository.findById(id);
    if (!message) throw new NotFoundError('Contact message not found');
    
    return contactRepository.updateStatus(id, status);
  }
}

export const contactService = new ContactService();
