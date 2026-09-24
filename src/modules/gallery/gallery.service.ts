import { galleryRepository } from './gallery.repository';
import { NotFoundError } from '../../types/errors';
import { CreateGalleryItemInput, UpdateGalleryItemInput, ListGalleryQuery } from './gallery.validator';
import { buildPaginationMeta } from '../../utils/pagination';

export class GalleryService {
  async createGalleryItem(data: CreateGalleryItemInput) {
    return galleryRepository.create(data);
  }

  async getGalleryItems(query: ListGalleryQuery) {
    const items = await galleryRepository.findAll(query);
    const total = await galleryRepository.count(query);
    const meta = buildPaginationMeta(total, query.page || 1, query.limit || 20);
    return { items, meta };
  }

  async updateGalleryItem(id: string, data: UpdateGalleryItemInput) {
    const item = await galleryRepository.findById(id);
    if (!item) throw new NotFoundError('Gallery item not found');
    return galleryRepository.update(id, data);
  }

  async deleteGalleryItem(id: string) {
    const item = await galleryRepository.findById(id);
    if (!item) throw new NotFoundError('Gallery item not found');
    return galleryRepository.delete(id);
  }
}

export const galleryService = new GalleryService();
