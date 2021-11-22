import request from '@/utils/request'

/*
 * CRON定时
 */

export function add(data) {
  return request({
    url: 'api/cron',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/cron',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/cron',
    method: 'put',
    data
  })
}

export default { add, edit, del }
