import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, FAB, ActivityIndicator, IconButton, Card, useTheme, TextInput, Dialog, Portal, Button } from 'react-native-paper';
import { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation, Category } from '../services/api/categoryApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminCategoryManager'>;

export default function AdminCategoryManagerScreen({ navigation }: Props) {
    const theme = useTheme();
    const { data: categoryData, isLoading } = useGetCategoriesQuery();
    const [createCategory] = useCreateCategoryMutation();
    const [updateCategory] = useUpdateCategoryMutation();
    const [deleteCategory] = useDeleteCategoryMutation();

    const categories = categoryData?.data || [];

    const [isDialogVisible, setIsDialogVisible] = React.useState(false);
    const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
    const [categoryName, setCategoryName] = React.useState('');

    const handleBack = () => navigation.goBack();

    const handleSave = async () => {
        if (!categoryName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
            return;
        }

        try {
            if (editingCategory) {
                await updateCategory({ id: editingCategory.id, updates: { name: categoryName } }).unwrap();
                Alert.alert('Thành công', 'Đã cập nhật danh mục');
            } else {
                await createCategory({ name: categoryName }).unwrap();
                Alert.alert('Thành công', 'Đã thêm danh mục mới');
            }
            closeDialog();
        } catch (error: any) {
            Alert.alert('Lỗi', error.data?.message || 'Không thể thực hiện thao tác');
        }
    };

    const handleDelete = (id: number, name: string) => {
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc muốn xóa danh mục "${name}"? Thao tác này có thể ảnh hưởng đến các sản phẩm thuộc danh mục này.`,
            [
                { text: 'Hủy', style: 'cancel' },
                { 
                    text: 'Xóa', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteCategory(id).unwrap();
                            Alert.alert('Thành công', 'Đã xóa danh mục');
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.data?.message || 'Không thể xóa danh mục');
                        }
                    }
                }
            ]
        );
    };

    const openDialog = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setCategoryName(category.name);
        } else {
            setEditingCategory(null);
            setCategoryName('');
        }
        setIsDialogVisible(true);
    };

    const closeDialog = () => {
        setIsDialogVisible(false);
        setEditingCategory(null);
        setCategoryName('');
    };

    const renderCategoryItem = ({ item }: { item: Category }) => (
        <Card style={styles.card}>
            <View style={styles.cardRow}>
                <View style={[styles.colorBadge, { backgroundColor: theme.colors.primaryContainer }]} />
                <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{item.name}</Text>
                    <Text style={styles.categoryStatus}>Trạng thái: {item.isActive ? 'Đang hoạt động' : 'Tạm khóa'}</Text>
                </View>
                <View style={styles.actions}>
                    <IconButton 
                        icon="pencil" 
                        size={20} 
                        onPress={() => openDialog(item)} 
                    />
                    <IconButton 
                        icon="delete" 
                        size={20} 
                        iconColor="#EF4444" 
                        onPress={() => handleDelete(item.id, item.name)} 
                    />
                </View>
            </View>
        </Card>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quản lý Danh mục</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                {isLoading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color={theme.colors.primary} />
                ) : (
                    <FlatList
                        data={categories}
                        renderItem={renderCategoryItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text>Không tìm thấy danh mục nào</Text>
                            </View>
                        }
                    />
                )}
            </View>

            <FAB
                style={styles.fab}
                icon="plus"
                label="Thêm danh mục"
                onPress={() => openDialog()}
            />

            <Portal>
                <Dialog visible={isDialogVisible} onDismiss={closeDialog}>
                    <Dialog.Title>{editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Tên danh mục"
                            value={categoryName}
                            onChangeText={setCategoryName}
                            mode="outlined"
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={closeDialog}>Hủy</Button>
                        <Button onPress={handleSave}>Lưu</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    backIcon: { fontSize: 24, fontWeight: 'bold' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { flex: 1, padding: 16 },
    listContent: { paddingBottom: 80 },
    card: {
        marginBottom: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 2,
    },
    cardRow: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
    },
    colorBadge: {
        width: 12,
        height: 48,
        borderRadius: 6,
    },
    categoryInfo: {
        flex: 1,
        marginLeft: 16,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    categoryStatus: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#10B981',
    },
    emptyState: { alignItems: 'center', marginTop: 40 }
});
