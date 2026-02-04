import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Chip, ActivityIndicator, useTheme } from 'react-native-paper';
import { useGetCategoriesQuery } from '../services/api/categoryApi';

interface CategorySliderProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

export default function CategorySlider({ selectedCategory, onSelectCategory }: CategorySliderProps) {
    const theme = useTheme();
    const { data: categoryData, isLoading, error } = useGetCategoriesQuery();

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" />
            </View>
        );
    }

    if (error || !categoryData?.data) {
        return null;
    }

    const categories = categoryData.data;

    const allCategories = [
        { id: 0, name: 'All', order: 0, isActive: true },
        ...categories,
    ];

    return (
        <View style={styles.filterContainer}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}
            >
                {allCategories.map((category) => (
                    <Chip
                        key={category.id}
                        mode="outlined"
                        selected={selectedCategory === category.name}
                        onPress={() => onSelectCategory(category.name)}
                        style={[
                            styles.chip,
                            selectedCategory === category.name && {
                                backgroundColor: theme.colors.primaryContainer
                            }
                        ]}
                        showSelectedOverlay
                    >
                        {category.name}
                    </Chip>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    filterContainer: {
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderTopWidth: 0,
    },
    filterScroll: {
        paddingHorizontal: 15,
    },
    chip: {
        marginRight: 8,
    },
});
