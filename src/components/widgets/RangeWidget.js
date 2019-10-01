import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/styles";

import { rangeSpec } from "../../utils";
//const classes = PropTypes.object.isRequired;

const styles = theme => ({
  min_label: {
    textAlign: "right",
    clear: "both",
    float: "left",
  },
  baseInput_margin: {
    marginLeft: "13px",
    width: "95% !important",
  },
  max_label: {
    float: "right",
    marginTop: "-22px",
  },
});

function RangeWidget(props) {
  const {
    schema,
    value,
    registry: {
      widgets: { BaseInput },
    },
  } = props;
  const { classes } = props;

  return (
    <div className="field-range-wrapper">
      <label className={classes.min_label}>{props.schema.minimum}</label>
      <BaseInput
        type="range"
        className={classes.baseInput_margin}
        {...props}
        value={value ? value : 0}
        {...rangeSpec(schema)}
      />
      <label className={classes.max_label}>{props.schema.maximum}</label>
      <span className="range-view">{value}</span>
    </div>
  );
}

if (process.env.NODE_ENV !== "production") {
  RangeWidget.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    classes: PropTypes.object.isRequired,
  };
}

export default withStyles(styles)(RangeWidget);
