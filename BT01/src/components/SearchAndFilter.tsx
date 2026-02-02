import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Searchbar, Chip, useTheme } from 'react-native-paper';

interface SearchAndFilterProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    categories: string[];
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories
}) => {
    const theme = useTheme();

    return (
        <View style={styles.stickyHeaderContainer}>
            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: theme.colors.primary }]}>
                <Searchbar
                    placeholder="Search clothes..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={{ minHeight: 0 }}
                    mode="bar"
                />
            </View>

            {/* Categories Filter */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    {categories.map((cat) => (
                        <Chip
                            key={cat}
                            mode="outlined"
                            selected={selectedCategory === cat}
                            onPress={() => setSelectedCategory(cat)}
                            style={[styles.chip, selectedCategory === cat && { backgroundColor: theme.colors.primaryContainer }]}
                            showSelectedOverlay
                        >
                            {cat}
                        </Chip>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    stickyHeaderContainer: {
        backgroundColor: '#fff',
        elevation: 4,
        zIndex: 1000,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    searchBar: {
        borderRadius: 8,
        backgroundColor: 'white',
        height: 45,
    },
    filterContainer: {
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
    },
    filterScroll: {
        paddingHorizontal: 15,
    },
    chip: {
        marginRight: 8,
    },
});

export default SearchAndFilter;
