import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, Image, ScrollView } from 'react-native';

export default function App() {
  const [page, setPage] = useState('home'); // Управление страницами
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null); // Для хранения выбранного товара

  // Загрузка продуктов с API
  const fetchProducts = async (pageNum) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/photos?_limit=10&_page=${pageNum}`);
      const data = await response.json();
      setProducts((prev) => [
        ...prev,
        ...data.map((item) => ({
          id: item.id,
          name: item.title,
          price: Math.floor(Math.random() * 1000 + 100),
          description: `Описание товара ${item.title}`,
          thumbnailUrl: item.thumbnailUrl,
        })),
      ]);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(pageNumber);
  }, [pageNumber]);

  const handleLogin = () => {
    if (username === 'user' && password === '1234') {
      setUser({ username });
      setPage('profile');
      Alert.alert('Успех', 'Вы вошли в систему!');
    } else {
      Alert.alert('Ошибка', 'Неверный логин или пароль');
    }
  };

  const handleRegister = () => {
    Alert.alert('Успех', 'Регистрация завершена! Используйте логин: user, пароль: 1234.');
    setPage('login');
  };

  const addToCart = (item) => {
    setCart([...cart, item]);
    Alert.alert('Добавлено в корзину', `${item.name} добавлен в корзину!`);
  };

  const checkout = () => {
    if (cart.length === 0) {
      Alert.alert('Корзина пуста', 'Добавьте товары в корзину перед оформлением заказа.');
      return;
    }
    setOrders([...orders, { id: Date.now(), items: [...cart] }]);
    setCart([]);
    Alert.alert('Успех', 'Ваш заказ оформлен!');
  };

  const openProduct = (item) => {
    setSelectedProduct(item);
    setPage('product');
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity style={styles.product} onPress={() => openProduct(item)}>
      <Image source={{ uri: item.thumbnailUrl }} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price}₸</Text>
    </TouchableOpacity>
  );

  const renderOrder = ({ item }) => (
    <View style={styles.order}>
      <Text style={styles.orderTitle}>Заказ #{item.id}</Text>
      {item.items.map((product) => (
        <View key={product.id} style={styles.orderItem}>
          <Image source={{ uri: product.thumbnailUrl }} style={styles.productImageSmall} />
          <Text style={styles.orderItemText}>
            {product.name} - {product.price}₸
          </Text>
        </View>
      ))}
    </View>
  );

  const renderPage = () => {
    switch (page) {
      case 'home':
        return (
          <View style={styles.container}>
            <Text style={styles.title}>IlyasShopping</Text>
            <FlatList
              data={products}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id.toString()}
              style={styles.list}
              onEndReached={() => setPageNumber((prev) => prev + 1)}
              onEndReachedThreshold={0.5}
              ListFooterComponent={loading ? <Text style={styles.loadingText}>Загрузка...</Text> : null}
            />
            <TouchableOpacity style={styles.navButton} onPress={() => setPage(user ? 'profile' : 'login')}>
              <Text style={styles.navButtonText}>Перейти в профиль</Text>
            </TouchableOpacity>
          </View>
        );

      case 'product':
        if (!selectedProduct) return null;
        return (
          <ScrollView style={styles.container}>
            <Image source={{ uri: selectedProduct.thumbnailUrl }} style={styles.productImageLarge} />
            <Text style={styles.title}>{selectedProduct.name}</Text>
            <Text style={styles.productDescription}>{selectedProduct.description}</Text>
            <Text style={styles.productPriceLarge}>Цена: {selectedProduct.price}₸</Text>
            <TouchableOpacity style={styles.button} onPress={() => addToCart(selectedProduct)}>
              <Text style={styles.buttonText}>Добавить в корзину</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.link} onPress={() => setPage('home')}>
              <Text style={styles.linkText}>Вернуться в магазин</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case 'login':
        return (
          <View style={styles.container}>
            <Text style={styles.title}>Вход</Text>
            <TextInput
              style={styles.input}
              placeholder="Логин"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Пароль"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Войти</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.link} onPress={() => setPage('register')}>
              <Text style={styles.linkText}>Регистрация</Text>
            </TouchableOpacity>
          </View>
        );

      case 'register':
        return (
          <View style={styles.container}>
            <Text style={styles.title}>Регистрация</Text>
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Зарегистрироваться</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.link} onPress={() => setPage('login')}>
              <Text style={styles.linkText}>Вернуться к входу</Text>
            </TouchableOpacity>
          </View>
        );

      case 'profile':
        return (
          <View style={styles.container}>
            <Text style={styles.title}>Профиль</Text>
            <Text style={styles.subtitle}>Добро пожаловать, {user.username}!</Text>
            <Text style={styles.cartTitle}>Корзина:</Text>
            {cart.length === 0 ? (
              <Text style={styles.emptyCart}>Корзина пуста</Text>
            ) : (
              cart.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <Image source={{ uri: item.thumbnailUrl }} style={styles.productImageSmall} />
                  <Text>{item.name} - {item.price}₸</Text>
                </View>
              ))
            )}
            <TouchableOpacity style={styles.button} onPress={checkout}>
              <Text style={styles.buttonText}>Оформить заказ</Text>
            </TouchableOpacity>
            <Text style={styles.cartTitle}>История заказов:</Text>
            {orders.length === 0 ? (
              <Text style={styles.emptyCart}>Нет оформленных заказов</Text>
            ) : (
              <FlatList
                data={orders}
                renderItem={renderOrder}
                keyExtractor={(item) => item.id.toString()}
              />
            )}
            <TouchableOpacity style={styles.link} onPress={() => setPage('home')}>
              <Text style={styles.linkText}>Вернуться в магазин</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return <View style={styles.container}>{renderPage()}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  product: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12 },
  productImage: { width: '100%', height: 150, borderRadius: 8 },
  productImageLarge: { width: '100%', height: 300, borderRadius: 8, marginBottom: 16 },
  productName: { fontSize: 18, marginVertical: 8 },
  productPrice: { color: '#555' },
  productDescription: { fontSize: 16, color: '#333', marginVertical: 8 },
  productPriceLarge: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: '#007BFF', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  link: { marginTop: 8, alignItems: 'center' },
  linkText: { color: '#007BFF' },
  list: { marginBottom: 16 },
  navButton: { backgroundColor: '#28A745', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  navButtonText: { color: '#fff', fontWeight: 'bold' },
  loadingText: { textAlign: 'center', color: '#888', marginVertical: 16 },
  cartTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 8 },
  cartItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  productImageSmall: { width: 40, height: 40, marginRight: 8 },
  emptyCart: { textAlign: 'center', color: '#888' },
  order: { marginBottom: 16, padding: 16, backgroundColor: '#fff', borderRadius: 8 },
  orderTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  orderItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  orderItemText: { fontSize: 14 },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  product: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 16,
    color: '#888',
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 8,
    borderRadius: 4,
  },
  link: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#3498db',
  },
  navButton: {
    marginTop: 16,
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 4,
  },
  navButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cartTitle: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  emptyCart: {
    color: '#888',
  },
  cartItem: {
    fontSize: 16,
    marginVertical: 4,
  },

});
