const WORKER_NAMES = {
    QUEUE_INTERNAL_WORKER: 'booklet_backend_queue_internal_worker'
};

enum JOB_NAMES {
    APARTMENT_CHECK_IN_PROCESSING = 'apartment_checkin_processing',
    APARTMENT_CHECK_OUT_PROCESSING = 'apartment_checkout_processing'
}

export { WORKER_NAMES, JOB_NAMES };
