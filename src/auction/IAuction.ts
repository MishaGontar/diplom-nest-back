interface Auction {
  id: number;
  name: string;
  description: string;
  auction_status: {
    name: string;
    id: number;
  };
  images?: {
    id: number;
    image_url: string;
  } | null;
  date_created: Date;
  date_finished: Date | null;
}

export interface IAuctionData extends Auction {
  sellers: {
    id: number;
    full_name: string;
    users: {
      images: {
        image_url: string | null;
      };
    };
  };
}

export interface IAuction extends Auction {
  sellers: {
    id: number;
    full_name: string;
    image_url: string | null;
  };
}

export const selectFullAuctionInformation = {
  id: true,
  name: true,
  description: true,
  auction_status: {
    select: {
      id: true,
      name: true,
    },
  },
  images: {
    select: {
      id: true,
      image_url: true,
    },
  },
  sellers: {
    select: {
      id: true,
      full_name: true,
      users: {
        select: {
          images: {
            select: {
              image_url: true,
            },
          },
        },
      },
    },
  },
  date_created: true,
  date_finished: true,
};
