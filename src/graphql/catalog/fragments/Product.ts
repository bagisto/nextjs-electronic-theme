import { gql } from "@apollo/client";

export const PRODUCT_CORE_FRAGMENT = gql`
  fragment ProductCore on Product {
    id
    sku
    type
    name
    price
    urlKey
    baseImageUrl
    minimumPrice
    specialPrice
    isSaleable
    reviews {
      edges {
        node {
          rating
        }
      }
    }
  }
`;

export const PRODUCT_DETAILED_FRAGMENT = gql`
  fragment ProductDetailed on Product {
    id
    sku
    type
    name
    urlKey
    description
    shortDescription
    price
    baseImageUrl
    minimumPrice
     specialPrice
     isSaleable
    groupedProducts {
      edges {
        node {
          id
          qty
          sortOrder
          associatedProduct {
            id
            name
            sku
            price
            formattedPrice
            specialPrice
            formattedSpecialPrice
            baseImageUrl
          }
        }
      }
    }
    bundleOptions {
      edges {
        node {
          id
          type
          isRequired
          sortOrder
          translation {
            label
          }
          bundleOptionProducts {
            edges {
              node {
                id
                qty
                isDefault
                isUserDefined
                sortOrder
                product {
                  id
                  name
                  sku
                  price
                  baseImageUrl
                }
              }
            }
          }
        }
      }
    }
     downloadableLinks {
      edges {
        node {
          _id
          type
          translation {
            title
          }
          price
          formattedPrice
          sampleType
          sampleFile
          sampleFileUrl
          sampleUrl
        }
      }
    }
    downloadableSamples {
      edges {
        node {
          _id
          type
          file
          fileUrl
          url
          translation {
            title
          }
        }
      }
    }
      bookingProducts {
      edges {
        node {
          _id
          type
          availableFrom
          availableTo
          qty
          location
          availableEveryWeek
          eventTickets {
            edges {
              node {
                id
                _id
                bookingProductId
                price
                qty
                specialPrice
                specialPriceFrom
                specialPriceTo
                formattedPrice
                formattedSpecialPrice
                translation {
                  locale
                  name
                  description
                }
                translations {
                  edges {
                    node {
                      locale
                      name
                      description
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    variants {
      edges {
        node {
          id
          sku
          baseImageUrl
        }
      }
    }
    reviews {
        edges {
            node {
            rating
            id
            name
            title
            comment
            createdAt
            }
        }
      }
  }
`;

export const PRODUCT_REVIEW_FRAGMENT = gql`
  fragment ProductReview on Review {
    rating
    id
    _id
    name
    title
    comment
  }
`;

export const PRODUCT_SECTION_FRAGMENT = gql`
  fragment ProductSection on Product {
    id
    sku
    name
    urlKey
    type
    baseImageUrl
    price
    minimumPrice
    isSaleable
    reviews {
      edges {
        node {
          rating
        }
      }
    }
    variants {
      edges {
        node {
          id
          sku
          attributeValues {
            edges {
              node {
                value
                attribute {
                  adminName
                  code
                }
              }
            }
          }
        }
      }
    }
  }
`;
