import { NormalizedRates } from 'reducers/swap/types';
import React, { Component } from 'react';
import { toFixedIfLarger } from 'utils/formatters';
import './CurrentRates.scss';
import { ProviderName } from 'actions/swap';
import isEqual from 'lodash/isEqual';

interface RateInputProps {
  rate: number;
  amount: number;
  pair: string;
  origin: string;
  destination: string;
  onChange: any;
}

export const RateInput: React.SFC<RateInputProps> = ({
  rate,
  amount,
  pair,
  origin,
  destination,
  onChange
}) => {
  return amount ? (
    <div className="SwapRates-panel-rate">
      <input
        className="SwapRates-panel-rate-input"
        onChange={onChange}
        value={amount}
        name={pair}
      />
      <span className="SwapRates-panel-rate-amount">
        {` ${origin} = ${toFixedIfLarger(amount * rate, 6)} ${destination}`}
      </span>
    </div>
  ) : null;
};

interface Props {
  provider: ProviderName;
  rates: NormalizedRates;
}

interface State {
  pairs: { [pair: string]: number };
  didSetupPairs: boolean;
}

export default class Rates extends Component<Props, State> {
  public state = {
    pairs: {},
    didSetupPairs: false
  };

  public componentDidMount() {
    this.setState(this.setupPairs());
  }

  public componentDidUpdate() {
    const newState = this.setupPairs();
    if (!isEqual(this.state, newState)) {
      this.setState(newState);
    }
  }

  public setupPairs = () => {
    const { rates } = this.props;
    const { allIds } = rates;
    const state = allIds.reduce((acc, cur) => {
      acc[cur] = 1;
      return acc;
    }, {});
    return { pairs: state, didSetupPairs: true };
  };

  public onChange = (event: any) => {
    const { value } = event.target;
    const { name } = event.target;
    this.setState({
      pairs: {
        ...this.state.pairs,
        [name]: value
      }
    });
  };

  public buildRateInputs = () => {
    const { rates } = this.props;
    const { pairs } = this.state;

    const fullData: RateInputProps[] = [];

    rates.allIds.forEach(each => {
      fullData.push({
        rate: rates.byId[each].rate,
        amount: pairs[each],
        pair: each,
        origin: rates.byId[each].options[0],
        destination: rates.byId[each].options[1],
        onChange: this.onChange
      });
    });

    // TODO - don't hardcode only first 4 elements of array.
    // not likely to change until significant UI revamp, so not worth spending time on now
    return (
      <div>
        <div className="SwapRates-panel-side col-sm-6">
          <RateInput {...fullData[0]} />
          <RateInput {...fullData[1]} />
        </div>

        <div className="SwapRates-panel-side col-sm-6">
          <RateInput {...fullData[2]} />
          <RateInput {...fullData[3]} />
        </div>
      </div>
    );
  };

  public render() {
    return this.buildRateInputs();
  }
}