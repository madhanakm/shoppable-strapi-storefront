import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  price?: string;
  currency?: string;
  availability?: 'in stock' | 'out of stock';
  brand?: string;
  category?: string;
}

const SEOHead = ({
  title = 'Dharani Herbbals - Natural & Herbal Products',
  description = 'Discover premium natural and herbal products for your wellness journey. Quality assured, traditionally crafted remedies.',
  image = 'https://api.dharaniherbbals.com/uploads/logo.png',
  url = 'https://dharaniherbbals.com',
  type = 'website',
  price,
  currency = 'INR',
  availability = 'in stock',
  brand = 'Dharani Herbbals',
  category
}: SEOHeadProps) => {
  const fullTitle = title.includes('Dharani Herbbals') ? title : `${title} | Dharani Herbbals`;
  const fullUrl = url.startsWith('http') ? url : `https://dharaniherbbals.com${url}`;
  const fullImage = image?.startsWith('http') ? image : `https://api.dharaniherbbals.com${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="herbal products, natural remedies, ayurveda, wellness, health, organic, traditional medicine" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph (Facebook, LinkedIn) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Dharani Herbbals" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@dharaniherbbals" />

      {/* WhatsApp Sharing */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />

      {/* Product Specific (for Google Shopping) */}
      {type === 'product' && (
        <>
          <meta property="product:brand" content={brand} />
          <meta property="product:availability" content={availability} />
          {price && <meta property="product:price:amount" content={price} />}
          {price && <meta property="product:price:currency" content={currency} />}
          {category && <meta property="product:category" content={category} />}
        </>
      )}

      {/* Structured Data for Google */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === 'product' ? 'Product' : 'Organization',
          ...(type === 'product' ? {
            name: title,
            description,
            image: fullImage,
            brand: { "@type": "Brand", name: brand },
            ...(price && {
              offers: {
                "@type": "Offer",
                price,
                priceCurrency: currency,
                availability: `https://schema.org/${availability === 'in stock' ? 'InStock' : 'OutOfStock'}`
              }
            })
          } : {
            name: "Dharani Herbbals",
            description,
            url: fullUrl,
            logo: fullImage,
            sameAs: [
              "https://facebook.com/dharaniherbbals",
              "https://instagram.com/dharaniherbbals"
            ]
          })
        })}
      </script>

      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#22c55e" />
    </Helmet>
  );
};

export default SEOHead;