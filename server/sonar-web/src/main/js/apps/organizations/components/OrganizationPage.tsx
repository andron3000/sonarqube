/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Location } from 'history';
import OrganizationNavigation from '../navigation/OrganizationNavigation';
import { fetchOrganization } from '../actions';
import NotFound from '../../../app/components/NotFound';
import Suggestions from '../../../app/components/embed-docs-modal/Suggestions';
import {
  getOrganizationByKey,
  getCurrentUser,
  getMyOrganizations,
  Store
} from '../../../store/rootReducer';

interface OwnProps {
  children?: React.ReactNode;
  location: Location;
  params: { organizationKey: string };
}

interface StateProps {
  currentUser: T.CurrentUser;
  organization?: T.Organization;
  userOrganizations: T.Organization[];
}

interface DispatchToProps {
  fetchOrganization: (organizationKey: string) => Promise<void>;
}

type Props = OwnProps & StateProps & DispatchToProps;

interface State {
  loading: boolean;
}

export class OrganizationPage extends React.PureComponent<Props, State> {
  mounted = false;
  state: State = { loading: true };

  componentDidMount() {
    this.mounted = true;
    this.updateOrganization(this.props.params.organizationKey);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.params.organizationKey !== this.props.params.organizationKey) {
      this.updateOrganization(nextProps.params.organizationKey);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  stopLoading = () => {
    if (this.mounted) {
      this.setState({ loading: false });
    }
  };

  updateOrganization = (organizationKey: string) => {
    this.setState({ loading: true });
    this.props.fetchOrganization(organizationKey).then(this.stopLoading, this.stopLoading);
  };

  render() {
    const { organization } = this.props;

    if (!organization || !organization.actions || organization.actions.admin == null) {
      if (this.state.loading) {
        return null;
      } else {
        return <NotFound withContainer={false} />;
      }
    }

    return (
      <div>
        <Helmet defaultTitle={organization.name} titleTemplate={'%s - ' + organization.name} />
        <Suggestions suggestions="organization_space" />
        <OrganizationNavigation
          currentUser={this.props.currentUser}
          location={this.props.location}
          organization={organization}
          userOrganizations={this.props.userOrganizations}
        />
        {this.props.children}
      </div>
    );
  }
}

const mapStateToProps = (state: Store, ownProps: OwnProps) => ({
  currentUser: getCurrentUser(state),
  organization: getOrganizationByKey(state, ownProps.params.organizationKey),
  userOrganizations: getMyOrganizations(state)
});

const mapDispatchToProps = { fetchOrganization: fetchOrganization as any };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OrganizationPage);
