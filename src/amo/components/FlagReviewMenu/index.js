/* @flow */
import invariant from 'invariant';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import {
  REVIEW_FLAG_REASON_BUG_SUPPORT,
  REVIEW_FLAG_REASON_SPAM,
} from 'amo/constants';
import Link from 'amo/components/Link';
import FlagReview from 'amo/components/FlagReview';
import { getCurrentUser } from 'amo/reducers/users';
import translate from 'amo/i18n/translate';
import ListItem from 'amo/components/ListItem';
import TooltipMenu from 'amo/components/TooltipMenu';
import type { AppState } from 'amo/store';
import type { I18nType } from 'amo/types/i18n';
import type { UserType } from 'amo/reducers/users';
import type { UserReviewType } from 'amo/actions/reviews';

import './styles.scss';

type DefaultProps = {|
  isDeveloperReply?: boolean,
|};

type Props = {|
  ...DefaultProps,
  openerClass?: string,
  review: UserReviewType,
|};

type PropsFromState = {|
  siteUser: UserType | null,
  wasFlagged: boolean,
|};

type InternalProps = {|
  ...Props,
  ...PropsFromState,
  jed: I18nType,
|};

export class FlagReviewMenuBase extends React.Component<InternalProps> {
  static defaultProps: DefaultProps = {
    isDeveloperReply: false,
  };

  render(): React.Node {
    const { jed, isDeveloperReply, openerClass, review, siteUser, wasFlagged } =
      this.props;

    invariant(
      !siteUser || siteUser.id !== review.userId,
      'A user cannot flag their own review.',
    );

    const items = [
      <ListItem className="FlagReviewMenu-flag-spam-item" key="flag-spam">
        <FlagReview
          reason={REVIEW_FLAG_REASON_SPAM}
          review={review}
          buttonText={jed.gettext('Spam')}
          wasFlaggedText={jed.gettext('Flagged as spam')}
          disabled={!siteUser}
          disabledTitle={jed.gettext('Login required')}
        />
      </ListItem>,
      // Only reviews (not developer responses) can be flagged as
      // misplaced bug reports or support requests.
      isDeveloperReply ? null : (
        <ListItem
          className="FlagReviewMenu-flag-bug-support-item"
          key="flag-bug-support"
        >
          <FlagReview
            reason={REVIEW_FLAG_REASON_BUG_SUPPORT}
            review={review}
            buttonText={jed.gettext('Misplaced bug report or support request')}
            wasFlaggedText={jed.gettext(
              `Flagged as misplaced bug report or support request`,
            )}
            disabled={!siteUser}
            disabledTitle={jed.gettext('Login required')}
          />
        </ListItem>
      ),
      <ListItem
        className="FlagReviewMenu-flag-language-item"
        key="flag-language"
      >
        <Link to={`/feedback/review/${review.id}/`}>
          {jed.gettext(`Content that is illegal or that violates AMO's content
            policies`)}
        </Link>
      </ListItem>,
    ];

    return (
      <TooltipMenu
        className="FlagReviewMenu-menu"
        idPrefix="flag-review-"
        items={items}
        openerClass={openerClass}
        openerText={wasFlagged ? jed.gettext('Flagged') : jed.gettext('Flag')}
        openerTitle={
          isDeveloperReply
            ? jed.gettext('Flag this developer response')
            : jed.gettext('Flag this review')
        }
      />
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: Props): PropsFromState => {
  let wasFlagged = false;

  if (ownProps.review) {
    const view = state.reviews.view[ownProps.review.id];
    if (view && view.flag && view.flag.wasFlagged) {
      wasFlagged = true;
    }
  }

  return {
    wasFlagged,
    siteUser: getCurrentUser(state.users),
  };
};

const FlagReviewMenu: React.ComponentType<Props> = compose(
  connect(mapStateToProps),
  translate(),
)(FlagReviewMenuBase);

export default FlagReviewMenu;
