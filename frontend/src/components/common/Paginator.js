import React, { Fragment, Component } from "react";

export class Paginator extends Component {
  render() {
    const pageNumbers = [];
    for (let i = 1; i <= this.props.totalPages; i++) {
      pageNumbers.push(i);
    }

    const renderPageNumbers = pageNumbers.map((number) => {
      return (
        <li
          className="page-link"
          key={number}
          id={number}
          onClick={this.props.setPage}
        >
          {number}
        </li>
      );
    });

    const renderPaginator = () => {
      return (
        <nav>
          <ul className="pagination" style={{ marginBottom: "1em" }}>
            <li
              className="page-link"
              id="prev"
              onClick={this.props.setPrevNextPage}
            >
              {"<"}
            </li>
            {renderPageNumbers}
            <li
              className="page-link"
              id="next"
              onClick={this.props.setPrevNextPage}
            >
              {">"}
            </li>
          </ul>
        </nav>
      );
    };

    return <Fragment>{renderPaginator()}</Fragment>;
  }
}

export default Paginator;
