import React, { memo } from "react";
import "./Card.css";

const Card = memo(() => {
  return (
    <div className="basic-card basic-card-aqua">
      <div className="card-content">
        <span className="card-title">Card Title</span>
        <p className="card-text">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s.
        </p>
        <p>{"data.name"}</p>
      </div>

      <div className="card-link">
        <a href="#" title="Read Full">
          <span>Read Full</span>
        </a>
      </div>
    </div>
  );
});

export default Card;
