import isUndefined from 'lodash/isUndefined';
import React, { PropsWithChildren, useMemo } from 'react';

import { ContentSection } from '../../content/utilities/types';
import {
  shouldShowMainNavMenu,
  shouldShowSideNavMenu,
} from '../constants/breakpoint-sizes';
import { Slug } from '../constants/slugs';
import useDisplaySize from '../hooks/useDisplaySize';
import { Percent } from '../utilities/percent';
import DrawerMainNavMenu from './DrawerMainNavMenu';
import LoadingOverlay from './LoadingOverlay';
import MainNavMenu from './MainNavMenu';
import ProgressBar from './ProgressBar';
import SideNavMenu from './SideNavMenu';
import UnsupportedBrowserBanner from './UnsupportedBrowserBanner';

type ScreenProps = {
  /** The url slug corresponding to the screen that is currently open */
  activePage: Slug;
  /** Represents the sections of content on the screen and the index of the
   * current section */
  contentSections?: {
    /** The index of the section corresponding to the current scroll position */
    currentSectionIndex: number;
    /** Handler to fire on route hash change to recalculate the section index.
     * "onScroll" event does not consistently fire when following a hash link to
     * a same-page anchor, so we hook into the Next router's event instead to
     * manually recalculate the section index */
    recalculateSectionIndex?: () => void;
    /** The sections of the screen */
    sections: ContentSection<string>[];
  };
  /** Whether or not the current screen is undergoing a server render */
  rendering: boolean;
  /** The current scroll position of the Screen ref, used to render the
   * ProgressBar component */
  scrollPercent?: Percent;
};

/**
 * Outermost wrapper component for screens. Presents main and side menu
 * navigation and adjusts layout to display size.
 */
const Screen = React.forwardRef<HTMLDivElement, PropsWithChildren<ScreenProps>>(
  ({ activePage, children, contentSections, rendering, scrollPercent }, ref) => {
    const [displaySize] = useDisplaySize();

    /** If true, will always show the main left-hand navigation menu; otherwise,
    will show collapsible navigation menu drawer */
    const shouldShowMainNav = useMemo(() => shouldShowMainNavMenu(displaySize), [
      displaySize,
    ]);
    /** If true, will show the secondary right-hand navigation menu */
    const shouldShowSideNav = useMemo(() => shouldShowSideNavMenu(displaySize), [
      displaySize,
    ]);

    /** True if the user system preference is for a dark color scheme */
    // TODO: Re-enable after tweaking dark mode color scheme
    const prefersDarkMode = false; // useMediaQuery('(prefers-color-scheme: dark)');

    return (
      <div
        className="full-width full-height flex-column non-scrollable"
        data-theme={prefersDarkMode ? 'dark' : 'light'}
      >
        <UnsupportedBrowserBanner />
        {isUndefined(scrollPercent) ? null : (
          <ProgressBar scrollPercent={scrollPercent} />
        )}
        <div className="full-width flex-1 flex-row non-scrollable border-box">
          {shouldShowMainNav ? (
            <MainNavMenu activePage={activePage} />
          ) : (
            <DrawerMainNavMenu activePage={activePage} />
          )}
          {/* Lock scroll when screen is rendering */}
          <main
            className={`relative flex-1 flex-column margin-med ${
              rendering ? 'non-scrollable' : 'scrollable-y'
            }`}
            ref={ref}
          >
            {rendering ? <LoadingOverlay /> : null}
            {children}
          </main>
          {contentSections && shouldShowSideNav ? (
            <SideNavMenu
              activeSectionIndex={contentSections.currentSectionIndex}
              contentSections={contentSections.sections}
            />
          ) : null}
        </div>
      </div>
    );
  },
);

export default Screen;
