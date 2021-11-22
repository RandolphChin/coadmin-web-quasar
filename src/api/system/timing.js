import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/quartz',
    method: 'post',
    data
  })
}

export function del(data) {
  return request({
    url: 'api/quartz',
    method: 'delete',
    data
  })
}

export function edit(data) {
  return request({
    url: 'api/quartz',
    method: 'put',
    data
  })
}

export function pauseJob(data) {
  return request({
    url: 'api/quartz/pauseJob',
    method: 'put',
    data
  })
}

export function resumeJob(data) {
  return request({
    url: 'api/quartz/resumeJob',
    method: 'put',
    data
  })
}

export function execution(data) {
  return request({
    url: 'api/quartz/runOnce/',
    method: 'post',
    data
  })
}

export default { del, resumeJob, pauseJob, execution, add, edit }
