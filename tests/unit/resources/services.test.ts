import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appClient } from '@/src/utils/appClient';
import { getAuthTokenService } from '@/src/resources/auth/services/getAuthToken';
import { loginUserService } from '@/src/resources/auth/services/loginUser';
import { logoutUserService } from '@/src/resources/auth/services/logoutUser';
import { registerUserService } from '@/src/resources/auth/services/registerUser';
import { createInternalListService } from '@/src/resources/internal-list/services/createInternalList';
import { createInternalListItemService } from '@/src/resources/internal-list/services/createInternalListItem';
import { deleteInternalListService } from '@/src/resources/internal-list/services/deleteInternalList';
import { deleteInternalListItemService } from '@/src/resources/internal-list/services/deleteInternalListItem';
import { getInternalListsService } from '@/src/resources/internal-list/services/getInternalLists';
import { updateInternalListService } from '@/src/resources/internal-list/services/updateInternalList';
import { updateInternalListItemService } from '@/src/resources/internal-list/services/updateInternalListItem';
import { createListColumnService } from '@/src/resources/list-column/services/createListColumn';
import { deleteListColumnService } from '@/src/resources/list-column/services/deleteListColumn';
import { getListColumnsService } from '@/src/resources/list-column/services/getListColumns';
import { updateListColumnService } from '@/src/resources/list-column/services/updateListColumn';
import { getListConfigService } from '@/src/resources/list-config/services/getListConfig';
import { createListFieldService } from '@/src/resources/list-field/services/createListField';
import { deleteListFieldService } from '@/src/resources/list-field/services/deleteListField';
import { getListFieldsService } from '@/src/resources/list-field/services/getListFields';
import { updateListFieldService } from '@/src/resources/list-field/services/updateListField';
import { createListRecordService } from '@/src/resources/list-record/services/createListRecord';
import { deleteListRecordService } from '@/src/resources/list-record/services/deleteListRecord';
import { exportListRecordsService } from '@/src/resources/list-record/services/exportListRecords';
import { getListRecordsService } from '@/src/resources/list-record/services/getListRecords';
import { getListRecordsExportEstimateService } from '@/src/resources/list-record/services/getListRecordsExportEstimate';
import { updateListRecordService } from '@/src/resources/list-record/services/updateListRecord';
import { createObjectService } from '@/src/resources/object/services/createObject';
import { createObjectFieldService } from '@/src/resources/object/services/createObjectField';
import { deleteObjectService } from '@/src/resources/object/services/deleteObject';
import { deleteObjectFieldService } from '@/src/resources/object/services/deleteObjectField';
import { getObjectsService } from '@/src/resources/object/services/getObjects';
import { updateObjectFieldService } from '@/src/resources/object/services/updateObjectField';
import { approveUserService } from '@/src/resources/user/services/approveUser';
import { getUsersService } from '@/src/resources/user/services/getUsers';
import { rejectUserService } from '@/src/resources/user/services/rejectUser';

vi.mock('@/src/utils/appClient', () => ({
  appClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    blob: vi.fn(),
  },
}));

const signal = new AbortController().signal;
const ctx = { signal } as any;

function decodedUrl(fn: keyof typeof appClient) {
  return decodeURIComponent(vi.mocked(appClient[fn]).mock.calls[0][0] as string);
}

describe('services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('auth', () => {
    it('getAuthTokenService', () => {
      getAuthTokenService(ctx);
      expect(appClient.get).toHaveBeenCalledWith('/api/auth/token', { signal });
    });

    it('loginUserService', () => {
      const body = { email: 'a@a.com', password: 'secret123' };
      loginUserService({ body });
      expect(appClient.post).toHaveBeenCalledWith('/api/auth/login', { body });
    });

    it('logoutUserService', () => {
      logoutUserService({ body: { refresh_token: 'r' } });
      expect(appClient.post).toHaveBeenCalledWith('/api/auth/logout', { body: { refresh_token: 'r' } });
    });

    it('registerUserService', () => {
      const body = { name: 'Ana', email: 'a@a.com', password: 'secret123' };
      registerUserService({ body });
      expect(appClient.post).toHaveBeenCalledWith('/api/auth/register', { body });
    });
  });

  describe('internal-list', () => {
    it('getInternalListsService', () => {
      getInternalListsService(ctx);
      expect(appClient.get).toHaveBeenCalledWith('/api/settings/lists', { signal });
    });

    it('createInternalListService', () => {
      const body = { key: 'status', name: 'Status', display_style: 'badge' as const };
      createInternalListService({ body });
      expect(appClient.post).toHaveBeenCalledWith('/api/settings/lists', { body });
    });

    it('updateInternalListService', () => {
      updateInternalListService({ listId: 3, body: { name: 'X' } });
      expect(appClient.put).toHaveBeenCalledWith('/api/settings/lists/3', { body: { name: 'X' } });
    });

    it('deleteInternalListService', () => {
      deleteInternalListService({ listId: 3 });
      expect(appClient.delete).toHaveBeenCalledWith('/api/settings/lists/3');
    });

    it('createInternalListItemService', () => {
      createInternalListItemService({ listId: 3, body: { label: 'A' } });
      expect(appClient.post).toHaveBeenCalledWith('/api/settings/lists/3/items', { body: { label: 'A' } });
    });

    it('updateInternalListItemService', () => {
      updateInternalListItemService({ listId: 3, itemId: 7, body: { position: 1 } });
      expect(appClient.put).toHaveBeenCalledWith('/api/settings/lists/3/items/7', { body: { position: 1 } });
    });

    it('deleteInternalListItemService', () => {
      deleteInternalListItemService({ listId: 3, itemId: 7 });
      expect(appClient.delete).toHaveBeenCalledWith('/api/settings/lists/3/items/7');
    });
  });

  describe('list-column', () => {
    it('getListColumnsService', () => {
      getListColumnsService(ctx);
      expect(appClient.get).toHaveBeenCalledWith('/api/settings/columns', { signal });
    });

    it('createListColumnService', () => {
      const body = { field_key: 'pessoa', sub_path: 'nome', label: 'Nome' };
      createListColumnService({ body });
      expect(appClient.post).toHaveBeenCalledWith('/api/settings/columns', { body });
    });

    it('updateListColumnService', () => {
      updateListColumnService({ columnId: 2, body: { position: 0 } });
      expect(appClient.put).toHaveBeenCalledWith('/api/settings/columns/2', { body: { position: 0 } });
    });

    it('deleteListColumnService', () => {
      deleteListColumnService({ columnId: 2 });
      expect(appClient.delete).toHaveBeenCalledWith('/api/settings/columns/2');
    });
  });

  describe('list-config', () => {
    it('getListConfigService', () => {
      getListConfigService(ctx);
      expect(appClient.get).toHaveBeenCalledWith('/api/list-config', { signal });
    });
  });

  describe('list-field', () => {
    it('getListFieldsService', () => {
      getListFieldsService(ctx);
      expect(appClient.get).toHaveBeenCalledWith('/api/settings/fields', { signal });
    });

    it('createListFieldService', () => {
      const body = { key: 'titulo', label: 'Título', type: 'text' as const, required: true };
      createListFieldService({ body });
      expect(appClient.post).toHaveBeenCalledWith('/api/settings/fields', { body });
    });

    it('updateListFieldService', () => {
      updateListFieldService({ fieldId: 4, body: { label: 'Y' } });
      expect(appClient.put).toHaveBeenCalledWith('/api/settings/fields/4', { body: { label: 'Y' } });
    });

    it('deleteListFieldService', () => {
      deleteListFieldService({ fieldId: 4 });
      expect(appClient.delete).toHaveBeenCalledWith('/api/settings/fields/4');
    });
  });

  describe('list-record', () => {
    it('getListRecordsService without query', () => {
      getListRecordsService(ctx);
      expect(appClient.get).toHaveBeenCalledWith('/api/list-records', { signal });
    });

    it('getListRecordsService serializes only valid filters, page and per_page', () => {
      getListRecordsService({
        signal,
        query: {
          filters: [
            { column_id: 1, value: 'abc' },
            { column_id: 2, value: '   ' },
            { column_id: 0, value: 'ignored' },
          ],
          page: 2,
          per_page: 25,
        },
      });

      expect(decodedUrl('get')).toBe('/api/list-records?filters=[{"column_id":1,"value":"abc"}]&page=2&per_page=25');
    });

    it('createListRecordService', () => {
      createListRecordService({ body: { values: { a: 1 } } });
      expect(appClient.post).toHaveBeenCalledWith('/api/list-records', { body: { values: { a: 1 } } });
    });

    it('updateListRecordService', () => {
      updateListRecordService({ recordId: 9, body: { values: { a: 2 } } });
      expect(appClient.put).toHaveBeenCalledWith('/api/list-records/9', { body: { values: { a: 2 } } });
    });

    it('deleteListRecordService', () => {
      deleteListRecordService({ recordId: 9 });
      expect(appClient.delete).toHaveBeenCalledWith('/api/list-records/9');
    });

    it('exportListRecordsService ignores filters when apply_filters is false', () => {
      exportListRecordsService({ query: { filters: [{ column_id: 1, value: 'x' }], apply_filters: false } });
      expect(appClient.blob).toHaveBeenCalledWith('/api/list-records/export');
    });

    it('exportListRecordsService sends filters when apply_filters is true', () => {
      exportListRecordsService({ query: { filters: [{ column_id: 1, value: 'x' }, { column_id: 2, value: '' }], apply_filters: true } });
      expect(decodedUrl('blob')).toBe('/api/list-records/export?filters=[{"column_id":1,"value":"x"}]&apply_filters=true');
    });

    it('getListRecordsExportEstimateService without filters', () => {
      getListRecordsExportEstimateService(ctx);
      expect(appClient.get).toHaveBeenCalledWith('/api/list-records/export-estimate', { signal });
    });

    it('getListRecordsExportEstimateService with filters applied', () => {
      getListRecordsExportEstimateService({ signal, query: { filters: [{ column_id: 1, value: 'x' }], apply_filters: true } });
      expect(decodedUrl('get')).toBe('/api/list-records/export-estimate?filters=[{"column_id":1,"value":"x"}]&apply_filters=true');
    });
  });

  describe('object', () => {
    it('getObjectsService', () => {
      getObjectsService(ctx);
      expect(appClient.get).toHaveBeenCalledWith('/api/settings/objects', { signal });
    });

    it('createObjectService', () => {
      createObjectService({ body: { key: 'pessoa', name: 'Pessoa' } });
      expect(appClient.post).toHaveBeenCalledWith('/api/settings/objects', { body: { key: 'pessoa', name: 'Pessoa' } });
    });

    it('deleteObjectService', () => {
      deleteObjectService({ objectId: 5 });
      expect(appClient.delete).toHaveBeenCalledWith('/api/settings/objects/5');
    });

    it('createObjectFieldService', () => {
      const body = { key: 'nome', label: 'Nome', type: 'text' as const, required: true };
      createObjectFieldService({ objectId: 5, body });
      expect(appClient.post).toHaveBeenCalledWith('/api/settings/objects/5/fields', { body });
    });

    it('updateObjectFieldService', () => {
      updateObjectFieldService({ objectId: 5, fieldId: 6, body: { position: 2 } });
      expect(appClient.put).toHaveBeenCalledWith('/api/settings/objects/5/fields/6', { body: { position: 2 } });
    });

    it('deleteObjectFieldService', () => {
      deleteObjectFieldService({ objectId: 5, fieldId: 6 });
      expect(appClient.delete).toHaveBeenCalledWith('/api/settings/objects/5/fields/6');
    });
  });

  describe('user', () => {
    it('getUsersService without status', () => {
      getUsersService(ctx);
      expect(appClient.get).toHaveBeenCalledWith('/api/admin/users', { signal });
    });

    it('getUsersService with status', () => {
      getUsersService({ signal, query: { status: 'pending' } });
      expect(appClient.get).toHaveBeenCalledWith('/api/admin/users?status=pending', { signal });
    });

    it('approveUserService', () => {
      approveUserService({ userId: 2 });
      expect(appClient.patch).toHaveBeenCalledWith('/api/admin/users/2/approve', { body: {} });
    });

    it('rejectUserService', () => {
      rejectUserService({ userId: 2 });
      expect(appClient.patch).toHaveBeenCalledWith('/api/admin/users/2/reject', { body: {} });
    });
  });
});
