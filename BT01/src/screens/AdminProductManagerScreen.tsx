import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { Text, FAB, Searchbar, ActivityIndicator, IconButton, Card, useTheme, Dialog, Portal, Button, TextInput } from 'react-native-paper';
import { useGetProductsQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation, Product } from '../services/api/productApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminProductManager'>;

interface ProductFormData {
    name: string;
    description: string;
    price: string;
    category: string;
    imageUrl: string;
    stock: string;
    discount: string;
}

const initialForm: ProductFormData = {
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    stock: '',
    discount: '0',
};

export default function AdminProductManagerScreen({ navigation }: Props) {
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = React.useState('');
    const { data: productData, isLoading, refetch } = useGetProductsQuery({ q: searchQuery });
    const [createProduct] = useCreateProductMutation();
    const [updateProduct] = useUpdateProductMutation();
    const [deleteProduct] = useDeleteProductMutation();

    const products = productData?.data || [];

    const [isDialogVisible, setIsDialogVisible] = React.useState(false);
    const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
    const [formData, setFormData] = React.useState<ProductFormData>(initialForm);

    const handleBack = () => navigation.goBack();

    const handleOpenDialog = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price.toString(),
                category: product.category,
                imageUrl: product.imageUrl,
                stock: product.stock.toString(),
                discount: product.discount.toString(),
            });
        } else {
            setEditingProduct(null);
            setFormData(initialForm);
        }
        setIsDialogVisible(true);
    };

    const handleCloseDialog = () => {
        setIsDialogVisible(false);
        setEditingProduct(null);
        setFormData(initialForm);
    };

    const handleSave = async () => {
        const { name, price, stock, category, imageUrl } = formData;
        if (!name || !price || !stock || !category || !imageUrl) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ các trường bắt buộc');
            return;
        }

        const payload = {
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock),
            discount: Number(formData.discount),
        };

        try {
            if (editingProduct) {
                await updateProduct({ id: editingProduct.id, updates: payload }).unwrap();
                Alert.alert('Thành công', 'Đã cập nhật sản phẩm');
            } else {
                await createProduct(payload).unwrap();
                Alert.alert('Thành công', 'Đã thêm sản phẩm mới');
            }
            handleCloseDialog();
        } catch (error: any) {
            Alert.alert('Lỗi', error.data?.message || 'Không thể lưu sản phẩm');
        }
    };

    const handleDelete = (id: number, name: string) => {
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc muốn xóa sản phẩm "${name}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                { 
                    text: 'Xóa', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteProduct(id).unwrap();
                            Alert.alert('Thành công', 'Đã xóa sản phẩm');
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.data?.message || 'Không thể xóa sản phẩm');
                        }
                    }
                }
            ]
        );
    };

    const renderProductItem = ({ item }: { item: Product }) => (
        <Card style={styles.card}>
            <View style={styles.cardRow}>
                <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.productCategory}>{item.category}</Text>
                    <Text style={styles.productPrice}>{Number(item.price).toLocaleString('vi-VN')}đ</Text>
                    <Text style={styles.productStock}>Kho: {item.stock} | Đã bán: {item.soldCount}</Text>
                </View>
                <View style={styles.actions}>
                    <IconButton 
                        icon="pencil" 
                        size={20} 
                        onPress={() => handleOpenDialog(item)} 
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
                <Text style={styles.headerTitle}>Quản lý Sản phẩm</Text>
                <IconButton icon="refresh" onPress={() => refetch()} />
            </View>

            <View style={styles.content}>
                <Searchbar
                    placeholder="Tìm sản phẩm..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                />

                {isLoading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color={theme.colors.primary} />
                ) : (
                    <FlatList
                        data={products}
                        renderItem={renderProductItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text>Không tìm thấy sản phẩm nào</Text>
                            </View>
                        }
                    />
                )}
            </View>

            <FAB
                style={styles.fab}
                icon="plus"
                label="Thêm sản phẩm"
                onPress={() => handleOpenDialog()}
            />

            <Portal>
                <Dialog visible={isDialogVisible} onDismiss={handleCloseDialog} style={styles.dialog}>
                    <Dialog.Title>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</Dialog.Title>
                    <Dialog.ScrollArea style={{ maxHeight: 400 }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TextInput
                                label="Tên sản phẩm *"
                                value={formData.name}
                                onChangeText={(text) => setFormData({...formData, name: text})}
                                mode="outlined"
                                style={styles.input}
                            />
                            <TextInput
                                label="Giá (đ) *"
                                value={formData.price}
                                onChangeText={(text) => setFormData({...formData, price: text})}
                                mode="outlined"
                                keyboardType="numeric"
                                style={styles.input}
                            />
                            <TextInput
                                label="Giảm giá (%)"
                                value={formData.discount}
                                onChangeText={(text) => setFormData({...formData, discount: text})}
                                mode="outlined"
                                keyboardType="numeric"
                                style={styles.input}
                            />
                            <TextInput
                                label="Số lượng kho *"
                                value={formData.stock}
                                onChangeText={(text) => setFormData({...formData, stock: text})}
                                mode="outlined"
                                keyboardType="numeric"
                                style={styles.input}
                            />
                            <TextInput
                                label="Danh mục *"
                                value={formData.category}
                                onChangeText={(text) => setFormData({...formData, category: text})}
                                mode="outlined"
                                style={styles.input}
                                placeholder="VD: Điện tử, Thời trang..."
                            />
                            <TextInput
                                label="URL Hình ảnh *"
                                value={formData.imageUrl}
                                onChangeText={(text) => setFormData({...formData, imageUrl: text})}
                                mode="outlined"
                                style={styles.input}
                            />
                            <TextInput
                                label="Mô tả"
                                value={formData.description}
                                onChangeText={(text) => setFormData({...formData, description: text})}
                                mode="outlined"
                                multiline
                                numberOfLines={3}
                                style={styles.input}
                            />
                        </ScrollView>
                    </Dialog.ScrollArea>
                    <Dialog.Actions>
                        <Button onPress={handleCloseDialog}>Hủy</Button>
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
    searchBar: {
        marginBottom: 16,
        elevation: 0,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
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
    productImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    productInfo: {
        flex: 1,
        marginLeft: 12,
    },
    productName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    productCategory: {
        fontSize: 12,
        color: '#6B7280',
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6366F1',
        marginTop: 2,
    },
    productStock: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 2,
    },
    actions: {
        flexDirection: 'column',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#6366F1',
    },
    dialog: {
        backgroundColor: '#fff',
        borderRadius: 16,
    },
    input: {
        marginBottom: 12,
        backgroundColor: 'transparent',
    },
    emptyState: { alignItems: 'center', marginTop: 40 }
});
