import '../common/scss/main.scss';

import forEach from 'lodash/forEach';
import replace from 'lodash/replace';
import { NextComponentType } from 'next';
import { AppContext, AppProps } from 'next/app';
import { useRouter } from 'next/router';
import React, { FC, useEffect, useRef, useState } from 'react';

import Screen from '../common/components/Screen';
import { Slug } from '../common/constants/slugs';
import CombinedProvider from '../common/context';
import { useSectionHeightsState } from '../common/context/sectionHeightsState';
import useCurrentSectionIndex from '../common/hooks/useCurrentSectionIndex';
import useScrollInfo from '../common/hooks/useScrollInfo';
import { getSectionsForPage } from '../content/utilities/for-pages';

/**
 * Custom `App` container for all pages:
 * https://nextjs.org/docs/advanced-features/custom-app
 *
 * Used to persist layout and context between pages as well as apply css
 * globally
 */
const App: NextComponentType<AppContext, {}, AppProps> = ({ Component, pageProps }) => (
  <CombinedProvider>
    <InContext>
      <Component {...pageProps} />
    </InContext>
  </CombinedProvider>
);

/**
 * Parent container component one level deeper in order to access context
 */
const InContext: FC<{}> = ({ children }) => {
  // React `RefObject` to attach to the outermost `Screen` component
  const outerRef = useRef<HTMLDivElement>(null);
  const [rendering, setRendering] = useState(false);

  const router = useRouter();
  const isIndex = router.route === '/';
  // Strip starting "/" in path to get the `Slug`
  // router.asPath contains any hash in link, too
  const slug = replace(router.pathname, /^\//, '') as Slug;
  // Dictionary of section starting heights for each page in the app,
  // retrievable by the page's slug
  const state = useSectionHeightsState();
  // Get the section starting heights for this page
  const sectionHeights = state?.[slug] || [];

  // The index of the current section the user has scrolled to on the page, and
  // a method to manually recalculate that index
  const [sectionIndex, recalculateSectionIndex] = useCurrentSectionIndex(
    outerRef,
    sectionHeights,
  );

  // The `ContentSection`s for this page, if it has any
  const sections = getSectionsForPage(slug);

  // The percent of the page the user has scrolled
  const scrollPercent = useScrollInfo(outerRef)[1];

  useEffect(() => {
    /** Array to hold event listener clean up functions */
    let removeEventListenerFns: (() => void)[] = [];

    /** Handler to set rendering state */
    const onRouteStart = (): void => setRendering(true);

    /** Scroll handler to scroll to top of outer `Screen` component */
    const onRouteCompleteScroll = (): void => {
      outerRef.current?.scrollTo({ top: 0 });
      setRendering(false);
    };

    // Attach handler to router route change events (does not fire on hash link
    // changes like "#section2")
    router.events.on('routeChangeStart', onRouteStart);
    router.events.on('routeChangeComplete', onRouteCompleteScroll);

    if (recalculateSectionIndex) {
      // Attach handler to recalculate the section index on following a hash
      // link to a same-page anchor like "#section2" since `onScroll` event does
      // not consistently fire when following hash links
      router.events.on('hashChangeStart', recalculateSectionIndex);

      // Remove event handler to clean up
      removeEventListenerFns = [
        ...removeEventListenerFns,
        (): void => router.events.off('hashChangeStart', recalculateSectionIndex),
      ];
    }

    // Remove handler to clean up
    removeEventListenerFns = [
      ...removeEventListenerFns,
      (): void => router.events.off('routeChangeStart', onRouteStart),
      (): void => router.events.off('routeChangeComplete', onRouteCompleteScroll),
    ];

    // Call methods to remove all handlers
    return (): void => {
      forEach(removeEventListenerFns, (fn) => fn());
    };
  }, [recalculateSectionIndex, router.events]);

  return isIndex ? (
    <>{children}</>
  ) : (
    <Screen
      activePage={slug}
      contentSections={
        sections.length
          ? {
              currentSectionIndex: sectionIndex,
              sections,
            }
          : undefined
      }
      ref={outerRef}
      rendering={rendering}
      scrollPercent={scrollPercent}
    >
      {children}
    </Screen>
  );
};

export default App;
