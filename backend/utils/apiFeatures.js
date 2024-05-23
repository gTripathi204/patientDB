class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          message: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};
    // console.log(keyword)
    this.query = this.query.find({ ...keyword });
    return this;
  }

  // pagination
  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resultPerPage * (currentPage - 1);

    if (this.totalCount && skip >= this.totalCount) {
      this.query = this.query.limit(resultPerPage).skip(0);
    } else {
      this.query = this.query.limit(resultPerPage).skip(skip);
    }

    return this;
  }

  getCurrentPage() {
    return this.queryStr.page ? Number(this.queryStr.page) : 1;
  }

  setCurrentPage(page) {
    this.queryStr.page = page.toString();
    return this;
  }

  reverse() {
    this.query = this.query.sort({ _id: -1 });
    return this;
  }
}

module.exports = ApiFeatures;
