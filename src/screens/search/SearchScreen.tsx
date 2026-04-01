import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppLoader } from '../../components/common/AppLoader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import debounce from 'lodash/debounce';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';
import { normalize, scale, verticalScale } from '../../theme/scale';
import { spacing } from '../../theme/spacing';
import { palette } from '../../constants/colors';
import { SvgIcon } from '../../components/common/SvgIcon';
import { ArrowIcon, CloseIcon, SearchIcon } from '../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { addRecentSearch } from '../../store/slices/searchSlice';
import { searchApi, SearchItem } from '../../services/api/searchApi';
import { ROUTES } from '../../constants/routes';

const SUGGESTION_DEBOUNCE_MS = 300;
const SEARCH_PAGE_LIMIT = 10;

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const recentSearches = useAppSelector(state => state.search.recentSearches);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [resultsQuery, setResultsQuery] = useState('');
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [isResultsLoading, setIsResultsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const clearQuery = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setResults([]);
    setResultsQuery('');
    setPage(1);
    setHasMore(true);
  }, []);

  const fetchSuggestions = useCallback(async (text: string) => {
    setIsSuggestionsLoading(true);
    try {
      const data = await searchApi.getSuggestions(text);
      setSuggestions(data.suggestions);
    } catch {
      setSuggestions([]);
    } finally {
      setIsSuggestionsLoading(false);
    }
  }, []);

  const debouncedFetchSuggestions = useMemo(
    () => debounce(fetchSuggestions, SUGGESTION_DEBOUNCE_MS),
    [fetchSuggestions],
  );

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setSuggestions([]);
      setResults([]);
      setResultsQuery('');
      setPage(1);
      setHasMore(true);
      return;
    }

    setResults([]);
    setResultsQuery('');
    debouncedFetchSuggestions(trimmed);
  }, [query, debouncedFetchSuggestions]);

  useEffect(
    () => () => {
      debouncedFetchSuggestions.cancel();
    },
    [debouncedFetchSuggestions],
  );

  const handleSearch = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        return;
      }

      setIsResultsLoading(true);
      setPage(1);
      setHasMore(true);
      try {
        const data = await searchApi.searchItems(trimmed, 1, SEARCH_PAGE_LIMIT);
        setResults(data.items);
        setResultsQuery(trimmed);
        const totalPages = Math.ceil(
          data.pagination.total / data.pagination.limit,
        );
        setHasMore(data.pagination.page < totalPages);
        dispatch(addRecentSearch(trimmed));
      } catch {
        setResults([]);
        setResultsQuery(trimmed);
      } finally {
        setIsResultsLoading(false);
      }
    },
    [dispatch],
  );

  const handleSuggestionPress = useCallback(
    (text: string) => {
      setQuery(text);
      handleSearch(text);
    },
    [handleSearch],
  );

  const handleRecentPress = useCallback(
    (text: string) => {
      setQuery(text);
      handleSearch(text);
    },
    [handleSearch],
  );

  const showRecent = query.trim().length === 0;
  const showResults = resultsQuery.length > 0;
  const showSuggestions = !showRecent && !showResults;
  const canLoadMore = hasMore && !isResultsLoading && !isFetchingMore;

  const renderListItem = useCallback(
    ({ item }: { item: string }) => (
      <TouchableOpacity
        onPress={() =>
          showRecent ? handleRecentPress(item) : handleSuggestionPress(item)
        }
        style={styles.listItem}
        testID={`search-item-${item}`}
      >
        <Text style={[styles.listItemText, { color: colors.text }]}>
          {item}
        </Text>
      </TouchableOpacity>
    ),
    [colors.text, handleRecentPress, handleSuggestionPress, showRecent],
  );

  const renderResultItem = useCallback(
    ({ item, index }: { item: SearchItem; index: number }) => {
      const cardBg =
        index % 2 === 0
          ? palette.notificationIconBgLight
          : palette.searchResultCardBgBlue;
      const formattedDate = moment(item.created_at).format('D MMM YYYY');

      return (
        <TouchableOpacity
          style={styles.resultCard}
          testID={`search-result-${item.id}`}
          onPress={() =>
            (navigation as any).navigate(ROUTES.ITEM_DETAIL, {
              id: item.id,
            } as never)
          }
        >
          <View
            style={[
              styles.resultImageWrapper,
              {
                backgroundColor: cardBg,
                borderColor: palette.wishListRowBorder,
              },
            ]}
          >
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={styles.resultImage}
                resizeMode="cover"
              />
            ) : null}
          </View>
          <Text style={[styles.resultTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.resultDate, { color: colors.text }]}>
            {formattedDate}
          </Text>
        </TouchableOpacity>
      );
    },
    [colors.text, navigation],
  );

  const resultsContent = useMemo(() => {
    return results.length === 0 ? (
      <Text style={[styles.emptyResults, { color: colors.text }]}>
        {t('search.noResults')}
      </Text>
    ) : (
      <FlatList
        data={results}
        renderItem={renderResultItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.resultRow}
        contentContainerStyle={styles.resultList}
        onEndReached={() => {
          if (!canLoadMore) {
            return;
          }
          setIsFetchingMore(true);
          const nextPage = page + 1;
          searchApi
            .searchItems(resultsQuery, nextPage, SEARCH_PAGE_LIMIT)
            .then(data => {
              setResults(prev => [...prev, ...data.items]);
              setPage(data.pagination.page);
              const totalPages = Math.ceil(
                data.pagination.total / data.pagination.limit,
              );
              setHasMore(data.pagination.page < totalPages);
            })
            .finally(() => {
              setIsFetchingMore(false);
            });
        }}
        onEndReachedThreshold={0.2}
        ListFooterComponent={isFetchingMore ? <AppLoader /> : null}
        testID="results-list"
      />
    );
  }, [
    canLoadMore,
    colors.primary,
    colors.text,
    isFetchingMore,
    page,
    renderResultItem,
    results,
    resultsQuery,
    t,
  ]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      testID="search-screen"
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          testID="search-back-button"
        >
          <SvgIcon
            icon={ArrowIcon}
            size={18}
            color={palette.gray750}
            style={{ transform: [{ rotate: '180deg' }] }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View
          style={[
            styles.searchInputWrapper,
            {
              borderColor:
                query.trim().length > 0 ? colors.seekerGreen : colors.border,
              backgroundColor: colors.surface,
            },
          ]}
          testID="search-input-wrapper"
        >
          <SvgIcon
            icon={SearchIcon}
            size={scale(16)}
            color={palette.notificationMutedText}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={query}
            onChangeText={setQuery}
            placeholder={t('home.searchPlaceholder')}
            placeholderTextColor={palette.notificationMutedText}
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(query)}
            testID="search-input"
            autoFocus
            ref={inputRef}
          />
        </View>
        <TouchableOpacity
          onPress={clearQuery}
          style={styles.clearButton}
          testID="search-clear-button"
        >
          <SvgIcon icon={CloseIcon} size={scale(16)} color={colors.text} />
        </TouchableOpacity>
      </View>

      {showRecent && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('search.recentTitle')}
          </Text>
          <FlatList
            data={recentSearches}
            renderItem={renderListItem}
            keyExtractor={item => item}
            ItemSeparatorComponent={() => (
              <View
                style={[
                  styles.divider,
                  { backgroundColor: palette.wishListRowBorder },
                ]}
              />
            )}
            testID="recent-list"
          />
        </View>
      )}

      {showSuggestions && (
        <View style={styles.section}>
          {isSuggestionsLoading ? (
            <AppLoader />
          ) : (
            <FlatList
              data={suggestions}
              renderItem={renderListItem}
              keyExtractor={item => item}
              ItemSeparatorComponent={() => (
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: palette.wishListRowBorder },
                  ]}
                />
              )}
              testID="suggestions-list"
              contentContainerStyle={styles.container}
            />
          )}
        </View>
      )}

      {showResults && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('search.resultsFor', { query: resultsQuery })}
          </Text>
          {isResultsLoading ? <AppLoader /> : resultsContent}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(spacing.lg),
    marginTop: verticalScale(10),
    marginBottom: verticalScale(8),
  },
  backButton: {
    width: scale(42),
    height: scale(42),
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: palette.seekerGreen20,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(12),
    gap: scale(spacing.md),
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: normalize(12),
    borderWidth: 1,
    paddingHorizontal: scale(12),
    height: verticalScale(48),
    gap: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: normalize(14),
    fontWeight: '600',
  },
  clearButton: {
    width: scale(24),
    height: scale(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(20),
  },
  sectionTitle: {
    fontSize: normalize(14),
    fontWeight: '500',
    marginBottom: verticalScale(12),
  },
  listItem: {
    paddingVertical: verticalScale(10),
  },
  listItemText: {
    fontSize: normalize(16),
    fontWeight: '500',
  },
  divider: {
    height: 1,
  },
  resultList: {
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(24),
  },
  resultRow: {
    justifyContent: 'space-between',
    marginBottom: verticalScale(14),
  },
  resultCard: {
    width: '48%',
  },
  resultImageWrapper: {
    height: verticalScale(180),
    borderRadius: normalize(12),
    borderWidth: 1,
    marginBottom: verticalScale(8),
  },
  resultImage: {
    width: '100%',
    height: '100%',
    borderRadius: normalize(12),
  },
  resultTitle: {
    fontSize: normalize(14),
    fontWeight: '600',
    lineHeight: normalize(20),
  },
  resultDate: {
    fontSize: normalize(12),
    fontWeight: '400',
    opacity: 0.7,
    marginTop: verticalScale(4),
  },
  emptyResults: {
    fontSize: normalize(14),
    fontWeight: '500',
  },
});
