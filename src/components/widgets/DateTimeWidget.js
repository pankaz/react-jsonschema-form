import {
  DatePicker,
  DateTimePicker,
  MuiPickersUtilsProvider
} from "material-ui-pickers";

import MomentUtils from "@date-io/moment";
import PropTypes from "prop-types";
import React from "react";
import moment from "moment";

class DateTimeWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: this.props.value
    };
  }
  render() {
    const { options, onChange } = this.props;
    let { selectedDate } = this.state;
    const minDate = options.minDate
      ? moment(options.minDate)
      : moment().subtract(100, "years");
    const maxDate = options.maxDate
      ? moment(options.maxDate)
      : moment().add(100, "years");
    return (
      <MuiPickersUtilsProvider
        utils={MomentUtils}
        locale={this.props.selectedLocale}
        moment={moment}>
        <div className="picker">
          {options.renderDateTimePickerAsDatePicker ? (
            <DatePicker
              {...this.props}
              {...options}
              format={options.formatPattern}
              minDate={minDate}
              maxDate={maxDate}
              value={selectedDate !== undefined ? moment(selectedDate) : null}
              onChange={date => {
                this.setState({ selectedDate: date });
                if (!date) {
                  return onChange(undefined);
                }
                if (date.hour() <= new Date().getHours() && date.minutes() <= new Date().getMinutes())
                {
                  let utcDate = moment(date);
                  var modifiedDatePerOptions = utcDate.startOf("minute");
                  if (options.setDateTimeToEndOf) {
                    modifiedDatePerOptions = modifiedDatePerOptions.endOf(
                      options.setDateTimeToEndOf
                    );
                  }
                  return onChange(modifiedDatePerOptions.toJSON());
                } else {
                  return onChange(undefined);
                }
              }}
              onClear={e => {
                this.setState({ selectedDate: undefined });
                return onChange(undefined);
              }}
            />
          ) : (
            <DateTimePicker
              {...this.props}
              {...options}
              format={options.formatPattern}
              minDate={minDate}
              maxDate={maxDate}
              value={selectedDate !== undefined ? moment(selectedDate) : null}
              onChange={date => {
                this.setState({ selectedDate: date });
                if (!date) {
                  return onChange(undefined);
                }
                if (date.hour() <= new Date().getHours() && date.minutes() <= new Date().getMinutes())
                {
                  let utcDate = moment(date);
                  var modifiedDatePerOptions = utcDate.startOf("minute");
                  if (options.setDateTimeToEndOf) {
                    modifiedDatePerOptions = modifiedDatePerOptions.endOf(
                      options.setDateTimeToEndOf
                    );
                  }
                  return onChange(modifiedDatePerOptions.toJSON());
                } else {
                  return onChange(undefined);
                }
              }}
              onClear={e => {
                this.setState({ selectedDate: undefined });
                return onChange(undefined);
              }}
            />
          )}
        </div>
      </MuiPickersUtilsProvider>
    );
  }
}

if (process.env.NODE_ENV !== "production") {
  DateTimeWidget.propTypes = {
    value: PropTypes.string
  };
}

export default DateTimeWidget;
