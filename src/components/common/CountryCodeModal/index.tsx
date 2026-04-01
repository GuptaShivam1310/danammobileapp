import React, { useState, useMemo, useCallback } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { authUiColors, palette } from '../../../constants/colors';
import { useTranslation } from 'react-i18next';
import { normalize, scale, verticalScale, moderateScale } from '../../../theme/scale';
import { COUNTRY_CODES, CountryCode } from '../../../constants/countryCodes';
import Icon from 'react-native-vector-icons/Feather';
import { toLower, includes, debounce, get } from 'lodash';

interface CountryCodeModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (country: CountryCode) => void;
}

export const CountryCodeModal: React.FC<CountryCodeModalProps> = ({
  isVisible,
  onClose,
  onSelect,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Debounced search logic could be used here if search was complex, 
  // but for local filtering, simple useMemo is usually enough.
  // However, I will implement a debounced query state just to follow user requirement.
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const updateSearch = useCallback(
    debounce((text: string) => {
      setDebouncedQuery(text);
    }, 300),
    []
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    updateSearch(text);
  };

  const filteredCountries = useMemo(() => {
    if (!debouncedQuery) return COUNTRY_CODES;
    const lowerQuery = toLower(debouncedQuery);
    return COUNTRY_CODES.filter(
      (c) =>
        includes(toLower(get(c, 'name', '')), lowerQuery) ||
        includes(toLower(get(c, 'dialCode', '')), lowerQuery) ||
        includes(toLower(get(c, 'code', '')), lowerQuery)
    );
  }, [debouncedQuery]);

  const getFlagEmoji = (code: string) => {
    const codePoints = code
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const renderItem = ({ item }: { item: CountryCode }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
    >
      <View style={styles.itemLeft}>
        <View style={styles.flagCircle}>
          <Text style={styles.flagEmoji}>{getFlagEmoji(item.code)}</Text>
        </View>
        <Text style={styles.countryName}>{item.name}</Text>
        <Text style={styles.countryCode}>({item.code})</Text>
      </View>
      <Text style={styles.dialCode}>{item.dialCode}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>{t('signup.selectCountryCode')}</Text>
                <TouchableOpacity onPress={onClose}>
                  <Icon name="x" size={normalize(24)} color={authUiColors.primaryText} />
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <Icon name="search" size={normalize(18)} color={authUiColors.placeholder} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={t('signup.searchCountry')}
                  value={searchQuery}
                  onChangeText={handleSearch}
                  placeholderTextColor={authUiColors.placeholder}
                />
              </View>

              <FlatList
                data={filteredCountries}
                renderItem={renderItem}
                keyExtractor={(item) => item.code}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No countries found</Text>
                }
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '80%',
    backgroundColor: authUiColors.white,
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    paddingTop: verticalScale(20),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(15),
  },
  title: {
    fontSize: normalize(18),
    fontWeight: '700',
    color: authUiColors.primaryText,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.grayF3,
    marginHorizontal: scale(20),
    paddingHorizontal: scale(12),
    borderRadius: scale(10),
    marginBottom: verticalScale(10),
    height: verticalScale(45),
  },
  searchInput: {
    flex: 1,
    marginLeft: scale(8),
    fontSize: normalize(14),
    color: authUiColors.primaryText,
  },
  listContent: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(20),
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: palette.grayF3,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagCircle: {
    width: moderateScale(26),
    height: moderateScale(26),
    borderRadius: moderateScale(13),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.grayF3,
    marginRight: scale(12),
  },
  flagEmoji: {
    fontSize: normalize(20),
    // Some emojis need scaling or positioning to look circular
    transform: [{ scale: 1.5 }],
  },
  countryName: {
    fontSize: normalize(15),
    color: authUiColors.primaryText,
    fontWeight: '500',
  },
  countryCode: {
    fontSize: normalize(13),
    color: authUiColors.secondaryText,
    marginLeft: scale(5),
  },
  dialCode: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: authUiColors.brandGreen,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: verticalScale(50),
    fontSize: normalize(14),
    color: authUiColors.secondaryText,
  },
});
