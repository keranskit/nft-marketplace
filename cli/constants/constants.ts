export const NETWORKS = {
    SEPOLIA: 'sepolia',
    LOCALHOST: 'localhost'
}

export const INPUTS = {
    CREATE_LISTING: {
        command: 'create-listing',
        additionalParamsCount: 3
    },
    BUY_LISTING: {
        command: 'buy-listing',
        additionalParamsCount: 2
    },
    CANCEL_LISTING: {
        command: 'cancel-listing',
        additionalParamsCount: 1
    },
    CREATE_OFFER: {
        command: 'create-offer',
        additionalParamsCount: 2
    },
    ACCEPT_OFFER: {
        command: 'accept-offer',
        additionalParamsCount: 1
    },
    CANCEL_OFFER: {
        command: 'cancel-offer',
        additionalParamsCount: 1
    },
    BUY_LISTING_BY_ACCEPTED_OFFER: {
        command: 'buy-listing-by-offer',
        additionalParamsCount: 2
    },
}
