import React, { useRef, useEffect } from 'react';

import {
  Grid,
  TableHead,
  TablePagination,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Checkbox,
  Radio,
} from "@material-ui/core";

const OptionsList = props => {
  const {
    isMultiselect,
    cols,
    options,
    handleRowClick,
    getIndexOfSelectedRowFromSelectedOptionsList,
    pageSize,
    totalOptionsCount,
    pageNumber,
    handleChangePage,
    closeOptionPanel,
    valueOnKeyDown,
    callbackOnKeyDown,
    classes
  } = props;

  const inputEl = useRef();

  const hideColumns = [];
  if (options.length == 0) {
    return <p>No Records Found...</p>;
  }

  const handleKey = () => {
    if (valueOnKeyDown && valueOnKeyDown === 40) {
      inputEl.current.focus();
      callbackOnKeyDown(false);
    }
  }

  return (
    <Grid container className="AsyncMultDdown-opt__wrapper">
      <Grid item xs={12} className="AsyncMultDdown-opt__grid">
        <Table className="AsyncMultDdown-opt__table" tabIndex="-1">
          {
            valueOnKeyDown && valueOnKeyDown === 40 ? handleKey():''
          }
          <TableHead tabIndex="-1" ref={inputEl}>
            <TableRow tabIndex="0" className="AsyncMultDdown-opt-header">
              {/* <TableCell /> */}
              <div tabIndex="0" className={classes.headerWrapper}>
                {cols.map((column, key) => {
                  if (!column.hasOwnProperty("hide")) {
                    return <TableCell className={classes.headerCell} key={key}>{column.name}</TableCell>;
                  } else {
                    hideColumns.push(column.key);
                  }
                })}
              </div>
            </TableRow>
          </TableHead>
          {/* <TableBody tabIndex="-1"> */}

          {options && options.length && options.map((row, rowkey) => (
            <div tabIndex={rowkey + 1} onKeyPress={() => handleRowClick(row)} className={classes.tableBodyDivision}>
              <TableRow
                key={rowkey}
                hover
                selected={
                  getIndexOfSelectedRowFromSelectedOptionsList(row) !== -1
                }
                onClick={() => handleRowClick(row)}
                className="AsyncMultDdown-opt-rows"
                >
                {isMultiselect ? (
                  <TableCell key={rowkey} className={classes.bodyCell}>
                    <Checkbox
                      checked={
                        getIndexOfSelectedRowFromSelectedOptionsList(row) !== -1
                      }
                    />
                  </TableCell>
                ) : (
                    <TableCell key={rowkey} className={classes.bodyCell}>
                      <Radio
                        checked={
                          getIndexOfSelectedRowFromSelectedOptionsList(row) !== -1
                        }
                      />
                    </TableCell>
                  )}
                {Object.keys(row).map((cell, cellkey) => {
                  if (hideColumns.indexOf(cell) === -1) {
                    return <TableCell key={cellkey}>{row[cell]}</TableCell>;
                  }
                })}
              </TableRow>
            </div>
          ))}
          {/* </TableBody> */}
        </Table>
      </Grid>
      <Grid item xs={12} className="AsyncMultDdown-opt-btn__container">
        <Grid container direction="row" justify="flex-end">
          {totalOptionsCount > pageSize && (
            <TablePagination
              rowsPerPageOptions={[pageSize]}
              component="div"
              count={totalOptionsCount}
              rowsPerPage={pageSize}
              page={pageNumber}
              backIconButtonProps={{
                "aria-label": "Previous Page",
              }}
              nextIconButtonProps={{
                "aria-label": "Next Page",
              }}
              onChangePage={handleChangePage}
            />
          )}
          {isMultiselect && <Button onClick={closeOptionPanel}>Done</Button>}
        </Grid>
      </Grid>
    </Grid>
  );
};
export default OptionsList;