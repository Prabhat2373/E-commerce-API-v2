class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: 'i',
          },
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };
    //   Removing some fields for category
    const removeFields = ['keyword', 'page', 'limit', 'sort'];

    removeFields.forEach((key) => delete queryCopy[key]);

    // Filter For Price and Rating

    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

    this.query = this.query.find(JSON.parse(queryStr));

    // Sort by products
    console.log('features');
    console.log('query', this.queryStr);
    switch (this.queryStr.sort) {
      case 'priceAsc':
        console.log('ASSENDING');
        this.query = this.query.sort('price');
      case 'priceDsc':
        this.query = this.query.sort('-price');

      case 'ratingAsc':
        console.log('by Rating');
        this.query = this.query.sort('rating');

      case 'ratingDsc':
        this.query = this.query.sort('-rating');
    }

    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;

    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }
}

module.exports = ApiFeatures;
