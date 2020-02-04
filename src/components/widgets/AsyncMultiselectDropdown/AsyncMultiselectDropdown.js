import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import {
  Paper,
  TextField,
  CircularProgress,
  Grid,
  Icon,
} from "@material-ui/core";
import OptionsList from "./OptionsList";
import SelectionBar from "./SelectionBar";

const styles = {
  container: {
    display: "block",
  },
  inputField: {
    verticalAlign: "bottom",
    marginBottom: '0'
  },
  headerWrapper: {
    borderBottom: '1px solid rgba(224, 224, 224, 1)'
  },
  headerCell : {
    borderBottom: '0'
  },
  tableBodyDivision: {
    width : '100%',
    display: 'flex',
    alignItems: 'center',
    '& tr' : {
      width: '100%',
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
      '& td': {
        borderBottom: '0'
      }
    }
  }
};
class AsyncMultiselectDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSearching: false,
      searchText: "",
      options: [],
      pageNumber: 0,
      ...props.schema,
      storeValueOnKeyDown: false
    };
  }

  componentDidMount() {
    this.initStateFromProps();
    this.fetchData();
    document.addEventListener("click", this.handleClickOutside, true);
    document.addEventListener('keydown', this.keyHandler, true);
    this.moveFocus();
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleClickOutside, true);
  }

  keyHandler = async (e) => {
    var TABKEY = 9;
    if (e.keyCode === TABKEY) {
      await this.setState({ isSearching: false });
    }
  }

  moveFocus = () => {
    const node = ReactDOM.findDOMNode(this);
    node.addEventListener('keydown', function (e) {
      const active = document.activeElement;
      if (e.keyCode === 40 && active.nextSibling) {
        active.nextSibling.focus();
      }
      if (e.keyCode === 38 && active.previousSibling) {
        active.previousSibling.focus();
      }
    });
  }

  handleClickOutside = event => {
    const domNode = ReactDOM.findDOMNode(this);
    if (!domNode || !domNode.contains(event.target)) {
      this.closeOptionPanel();
    }
  };

  handleChange = event => {
    this.setState(
      { searchText: event.target.value, isSearching: true, pageNumber: 0 },
      () => this.fetchData()
    );
  };

  onKeyDown = async e => {
    if (e.keyCode === 8 && !this.state.searchText) {
      await this.setState({ selectedOptions: [] });
      this.onDeleteChoice();
      const {
        searchText,
        pageNumber,
        pageSize,
        loadOptions,
        loadOptionsCount
      } = this.state;

      let searchValue = undefined;
      let resLoadOptions = await loadOptions(searchValue, pageNumber, pageSize);
      let resLoadOptionsCount = await loadOptionsCount(searchValue);

      await this.setState({
        options: resLoadOptions,
        pageNumber: pageNumber,
        pageSize,
        totalOptionsCount: resLoadOptionsCount
      })
    }
  }

  actionOnKeyDown = async (e) => {
    if (e.keyCode === 40) {
      await this.setState({ storeValueOnKeyDown: e.keyCode, isSearching: true });
    } else {
      await this.setState({ storeValueOnKeyDown: false, isSearching: true });
    }
  }

  initStateFromProps = () => {
    const { cols, isMultiselect } = this.state;
    const value = this.props.value;
    let selectionColumn = "";
    let primaryColumn = "";

    for (let index = 0; index < cols.length; index++) {
      if (
        cols[index].displaySelected &&
        this.state.selectionColumn === undefined
      ) {
        selectionColumn = cols[index].key;
      }
      if (cols[index].primary && this.state.primaryColumn === undefined) {
        primaryColumn = cols[index].key;
      }
      if (
        this.state.primary !== undefined &&
        this.state.selectionColumn !== undefined
      ) {
        break;
      }
    }
    this.setState({ selectionColumn, primaryColumn });
    const selectedOptions = [];
    if (value) {
      if (!isMultiselect) {
        selectedOptions.push(this.state.getSelectedOptionDetails(value));
      } else {
        const selectedList = JSON.parse(value);
        selectedList.forEach(value => {
          const result = this.state.getSelectedOptionDetails(value);
          selectedOptions.push(result);
        });
      }
    }
    this.setState({ selectedOptions });
  };

  fetchData = async () => {
    const {
      searchText,
      pageNumber,
      loadOptions,
      loadOptionsCount,
      pageSize,
    } = this.state;

    this.setState({ isLoading: true });
    let resLoadOptions = await loadOptions(searchText, pageNumber, pageSize);
    let resLoadOptionsCount = await loadOptionsCount(searchText);
    await this.setState({
      options: resLoadOptions,
      pageNumber: pageNumber,
      pageSize,
      totalOptionsCount: resLoadOptionsCount,
      isLoading: false,
    })
  };

  handleChangePage = (event, page) => {
    this.setState({ pageNumber: page }, () => this.fetchData());
  };

  handleRowClick = async (selectedRow) => {
    let { selectedOptions, isMultiselect, primaryColumn } = this.state;
    const indexOfSelectedOption = this.getIndexOfSelectedRowFromSelectedOptionsList(
      selectedRow
    );

    if (indexOfSelectedOption !== -1) {
      selectedOptions.splice(indexOfSelectedOption, 1);
      if (!isMultiselect) {
        this.closeOptionPanel();
      }
    } else {
      if (!isMultiselect) {
        selectedOptions = [selectedRow];
        this.closeOptionPanel();
      } else {
        selectedOptions.push(selectedRow);
      }
    }

    await this.setState({ selectedOptions, searchText: '' });

    if (selectedOptions.length > 0) {
      if (!isMultiselect) {
        this.state.onSelectChoice(selectedOptions[0][primaryColumn]);
        this.props.onChange(selectedOptions[0][primaryColumn]);
      } else {
        selectedOptions = selectedOptions.map(value => value[primaryColumn]);
        this.state.onSelectChoice(JSON.stringify(selectedOptions));
        this.props.onChange(JSON.stringify(selectedOptions));
      }
    } else {
      this.state.onSelectChoice(undefined);
      this.props.onChange(undefined);
    }
  };

  onDeleteChoice = async deletedChoice => {
    let {
      selectionColumn,
      selectedOptions,
      isMultiselect,
      primaryColumn,
    } = this.state;

    await this.fetchData();

    for (let index = 0; index < selectedOptions.length; index++) {
      if (selectedOptions[index][selectionColumn] === deletedChoice) {
        selectedOptions.splice(index, 1);
        this.setState({ selectedOptions });
        if (selectedOptions.length > 0) {
          if (!isMultiselect) {
            this.state.onDeleteChoice(selectedOptions[0][primaryColumn]);
            this.props.onChange(selectedOptions[0][primaryColumn]);
          } else {
            selectedOptions = selectedOptions.map(
              value => value[primaryColumn]
            );
            this.state.onDeleteChoice(JSON.stringify(selectedOptions));
            this.props.onChange(JSON.stringify(selectedOptions));
          }
        } else {
          this.state.onDeleteChoice(undefined);
          this.props.onChange(undefined);
        }
      }
    }
  };

  getIndexOfSelectedRowFromSelectedOptionsList = selectedRow => {
    const { selectedOptions, primaryColumn } = this.state;
    let recordFounded = -1;
    for (let index = 0; index < selectedOptions.length; index++) {
      if (
        selectedOptions[index][primaryColumn] === selectedRow[primaryColumn]
      ) {
        recordFounded = index;
        break;
      }
    }
    return recordFounded;
  };

  closeOptionPanel = () => {
    if (this.state.pageNumber !== 0) {
      this.setState({ isSearching: false, pageNumber: 0 }, () =>
        this.fetchData()
      );
    } else if (this.state.isSearching) {
      this.setState({ isSearching: false });
    }
  };

  render() {
    const { label, classes, placeholder, disabled } = this.props;
    const {
      isSearching,
      searchText,
      options,
      pageNumber,
      pageSize,
      cols,
      customClass,
      totalOptionsCount,
      selectedOptions,
      selectionColumn,
      isMultiselect,
      isLoading,
      primaryColumn,
      getChipDisplayText,
      maxLength
    } = this.state;

    const loader = isLoading && (
      <CircularProgress size={25} style={{ marginLeft: 10 }} />
    );
    const selected = (
      <SelectionBar
        primaryColumn={primaryColumn}
        selectedOptions={selectedOptions}
        isMultiselect={isMultiselect}
        selectionColumn={selectionColumn}
        onDeleteChoice={this.onDeleteChoice}
        getChipDisplayText={getChipDisplayText}
        isDiabled={disabled}
      />
    );
    return (
      <div className={customClass}>
        <Grid
          container
          direction="row"
          align-items="center"
          className={classes.container}>
          <Grid item xs={12}>

            <div onKeyDown={this.actionOnKeyDown}>
              <TextField
                fullWidth
                label={label}
                placeholder={placeholder}
                className={classes.inputField}
                margin="normal"
                disabled={disabled}
                value={searchText}
                onChange={this.handleChange}
                onKeyDown={this.onKeyDown}
                inputProps={{
                  maxLength: maxLength
                }}
                onFocus={() => this.setState({ isSearching: true })}
                InputProps={{
                  startAdornment: selected,
                  endAdornment: (
                    <Icon onClick={() => this.setState({ isSearching: true })}>
                      arrow_drop_down
                  </Icon>
                  )
                }}
              />
            </div>
            {loader}
          </Grid>
        </Grid>
        <Paper className="AsyncMultiselectDropdown-paper">
            {isSearching && (
              <OptionsList
                isMultiselect={isMultiselect}
                pageSize={pageSize}
                totalOptionsCount={totalOptionsCount}
                pageNumber={pageNumber}
                cols={cols}
                options={options}
                handleChangePage={this.handleChangePage}
                handleRowClick={this.handleRowClick}
                closeOptionPanel={this.closeOptionPanel}
                getIndexOfSelectedRowFromSelectedOptionsList={
                  this.getIndexOfSelectedRowFromSelectedOptionsList
                }
                valueOnKeyDown={this.state.storeValueOnKeyDown}
                callbackOnKeyDown={this.actionOnKeyDown}
                classes={classes}
              />
            )}
        </Paper>
      </div>
    );
  }
}

AsyncMultiselectDropdown.propTypes = {
  schema: PropTypes.object.isRequired,
  placeholder: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

export default withStyles(styles)(AsyncMultiselectDropdown);